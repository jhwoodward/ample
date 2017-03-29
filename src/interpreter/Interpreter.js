var parse = require('./parse');
var utils = require('./utils');
var stateUtils = require('./stateUtils');
var State = require('./State');
var macroType = require('./constants').macroType;
var eventType = require('./constants').eventType;
var _ = require('lodash');

function Interpreter(macros, master) {
  this.macros = macros || [];
  this.macros.forEach(macro => {
    macro.parsed = parse(macro.value);
  });
  this.defaultPhraseParser = stateUtils.getDefaultPhraseParser(this.macros);

  if (master) {
    if (!master.states) {
      this.master = this.interpretMaster(master);
    } else {
      this.master = master;
    }
  } else {
    this.master = { states: [], marker: {} };
  }
}

Interpreter.prototype.interpretMaster = function (master) {
  var state = new State();
  this.isMaster = true; //to set markers instead of read them
  this.states = [state];
  this.next = undefined;
  this.events = [];
  this.generateState(parse(master, this.macros));

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
        pitch: { constraint: lastTickState.pitch.constraint },
        modifiers: lastTickState.modifiers,
        mutater: lastTickState.mutater,
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

Interpreter.prototype.getEvents = function () {

  var events = this.states.reduce((acc, s, i) => {
    if (i > 0 && s.parser.getEvents && !s.parser.waitForNote) {
      var e = s.parser.getEvents(s, this.states[i - 1]);
      acc = acc.concat(e);
    }
    return acc;
  }, []).sort(function (a, b) {
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
        if (!e.keyswitch) {
          filteredEvents.push(e);
          break;
        }
        if (!eventState.lastKeyswitch || e.pitch.value !== eventState.lastKeyswitch.pitch.value) {
          filteredEvents.push(e);
          eventState.lastKeyswitch = e;
        }
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
  this.states = [new State(this.defaultPhraseParser)];
  this.next = undefined;
  this.generateState(this.parse(part));

  return {
    states: this.states,
    events: this.getEvents()
  };
}

module.exports = Interpreter;
