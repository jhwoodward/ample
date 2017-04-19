var parse = require('./parse');
var utils = require('./utils');
var stateUtils = require('./stateUtils');
var State = require('./State');
var macroType = require('./constants').macroType;
var eventType = require('./constants').eventType;
var _ = require('lodash');

function Interpreter(macros, master) {
  this.macros = macros || [];
  this.macros.filter(macro => {
    return macro.type === macroType.annotation ||
      macro.type === macroType.substitution ||
      macro.type === macroType.articulation;
  }).forEach(macro => {
    macro.parsed = parse(macro.value, this.macros);
  });
  

  this.animations = {};
  this.macros.filter(macro => {
    return macro.type === macroType.animation;
  }).forEach(animation => {
    this.animations[animation.key] = [];
    for (var key in animation.values) {
      this.animations[animation.key].push({
        key: animation.key,
        percent: parseInt(key, 10),
        parsers: parse(animation.values[key])
      });
    }
    this.animations[animation.key].sort((a, b) => {
      return a.percent > b.percent ? 1 : -1;
    });
  });

  this.defaultPhraseParser = stateUtils.getDefaultPhraseParser(this.macros);

  this.master = { states: [], marker: {} };

  if (master) {
    if (!master.states) {
      this.master = this.interpretMaster(master);
    } else {
      this.master = master;
    }
  }
}

Interpreter.prototype.interpretMaster = function (master) {
  var state = new State();
  this.isMaster = true; //to set markers instead of read them
  this.states = [state];
  this.next = undefined;
  this.events = [];
  this.generateState(this.parse(master));

  //take only the final state for each tick;
  var states = this.states.reduce((acc, s) => {
    var tick = s.time.tick;
    if (acc.filter(m => { return m.tick === tick }).length) return acc;
    var tickStates = this.states.filter(x => { return x.time.tick === tick; });
    var lastTickState = tickStates[tickStates.length - 1];
    var m = {
      tick,
      state: {
        key: lastTickState.key,
        scale: lastTickState.scale,
        bassline: lastTickState.bassline,
        modifiers: lastTickState.modifiers,
        time: { tempo: lastTickState.time.tempo }
      }
    };
    acc.push(m);
    return acc;
  }, []);

  var marker = this.states.reduce((acc, s) => {
    if (s.marker) {
      acc[s.marker] = acc[s.marker] || [];
      acc[s.marker].push(s.time.tick);
    }
    return acc;
  }, {});

  return { states, marker };
}

Interpreter.prototype.parse = function (part) {
  return parse(part, this.macros);
}

Interpreter.prototype.generateState = function (parsers) {
  for (var i = 0; i < parsers.length; i++) {
    var parser = parsers[i];
    var state = this.next || this.getNextState();
    state.mutate(parser, this);
    if (parser.continue) {
      continue;
    }
    this.states.push(state);
    this.next = this.getNextState();
    if (parser.next) {
      parser.next(this.next);
    }
  }
}

Interpreter.prototype.getTopState = function () {
  return this.states[this.states.length - 1];
}

Interpreter.prototype.getNextState = function () {
  return this.getTopState().clone();
}

Interpreter.prototype.getAnimation = function () {
  var states = this.states.filter(s => { return s.animation !== undefined; });
  var animations = states.reduce((acc, s) => {
    if (s.animation.start) {
      acc.push({ key: s.animation.key, start: s.time.tick });
      return acc;
    }
    if (s.animation.end) {
      for (var i = acc.length - 1; i >= 0; i--) {
        if (acc[i].key === s.animation.key) {
          acc[i].end = s.time.tick;
          break;
        }
      }
    }
    return acc;
  }, []);

  var out = [];
  animations.forEach(a => {
    var duration = a.end - a.start, from, to;
    var steps = this.animations[a.key];
    steps.forEach((step, i) => {
      from = Math.round(step.percent * duration / 100) + a.start;
      if (i < steps.length - 1) {
        var next = steps[i + 1];
        to = Math.round(next.percent * duration / 100) + a.start;
      } else {
        to = a.end;
      }
      out.push({
        key: a.key,
        from,
        to,
        parsers: step.parsers,
        events: step.parsers.reduce((acc, p) => {
          acc = acc.concat(p.getEvents().map(e => {
            e.tick = from + e.offset;
            e.annotation = a.key;
            e.animation = true;
            return e;
          }));
          return acc;
        }, [])
      });
    });
  });
  return out;
}

Interpreter.prototype.getEvents = function () {

  //add animation events
  var animation = this.getAnimation();

  //append state phrase with animation values

  this.states.forEach(state => {
    animation.forEach(a => {
      if (state.time.tick >= a.from && state.time.tick < a.to) {
        state.phrase.append(a.parsers, a.key);
      }
    });
  });

  var events = this.states.reduce((acc, s, i) => {
    if (i > 0 && s.parser.getEvents) {
      var e = s.parser.getEvents(s, this.states[i - 1]);
      acc = acc.concat(e);
    }
    return acc;
  }, []);

  animation.forEach(a => {
    events = events.concat(a.events);
  })

  events.sort(function (a, b) {
    if (a.tick === b.tick) return 0;
    return a.tick > b.tick ? 1 : -1;
  });

  var filteredEvents = [];
  var eventState = {
    controller: {},
    lastKeyswitch: undefined
  };
  events.forEach(e => {
    switch (e.type) {
      case eventType.controller:
        if (e.value !== eventState.controller[e.controller]) {
          filteredEvents.push(e);
        }
        eventState.controller[e.controller] = e.value;
        break;
      case eventType.noteon:
        if (!e.keyswitch) {
          filteredEvents.push(e);
          break;
        }
        if (!eventState.lastKeyswitch || e.pitch.value !== eventState.lastKeyswitch.pitch.value) {
          filteredEvents.push(e);
          eventState.lastKeyswitch = e;
        }
        break;
      case eventType.noteoff:
        filteredEvents.push(e);
        /* if (!e.keyswitch) {
           filteredEvents.push(e);
           break;
         }
         if (!eventState.lastKeyswitch || e.pitch.value !== eventState.lastKeyswitch.pitch.value) {
           filteredEvents.push(e);
          // eventState.lastKeyswitch = e;
         }*/
        break;
      default:
        filteredEvents.push(e);
        break;
    }
  });

  return filteredEvents;

}

Interpreter.prototype.interpret = function (part) {

  this.isMaster = false;
  this.master.states.forEach(s => s.applied = false);
 
  var initState = new State(this.defaultPhraseParser);
  this.states = [initState];
  this.next = undefined;

  this.generateState(this.parse(part));

  return {
    states: this.states,
    events: this.getEvents()
  };
}

module.exports = Interpreter;
