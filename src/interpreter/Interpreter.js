var parse = require('./parse');
var utils = require('./utils');
var stateUtils = require('./stateUtils');
var State = require('./State');
var macroType = require('./constants').macroType;
var _ = require('lodash');

function Interpreter(macros) {
  this.macros = macros || [];
  this.macros.forEach(macro => {
    macro.parsed = parse(macro.value);
  });
  this.defaultPhraseParser = stateUtils.getDefaultPhraseParser(this.macros);
}

Interpreter.prototype.parse = function(part) {
  return parse(part, this.macros);
}
Interpreter.prototype.process = function (parsers) {

  for (var i = 0; i < parsers.length; i++) {
    var parser = parsers[i];

    var state = this.next || this.getNextState();

    state.mutateFromMaster();
    parser.mutateState(state, this);
    state.mutater = parser.type + ' (' + parser.string + ')';

    if (parser.getEvents) {
      var events = parser.getEvents(state, this.getTopState(), this.events);
      this.events = this.events.concat(events);
    }

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

Interpreter.prototype.interpret = function (part, master) {

  var markers, master;
  if (master) {
    var state = new State();
    state.isMaster = true; //to set markers instead of read them
    this.states = [state];
    this.next = undefined;
    this.events = [];
    this.process(parse(master, this.macros));

    //take only the final state for each tick;
    master = this.states.reduce((acc, s) => {
      var tick = s.time.tick;
      if (acc.filter(m => { return m.tick === tick }).length) return acc;
      var tickStates = this.states.filter(x => { return x.time.tick === tick; });
      var lastTickState = tickStates[tickStates.length - 1];
      var m = {
        tick: tick,
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

    markers = this.states.reduce((acc, s) => {
      if (s.marker) {
        acc[s.marker] = acc[s.marker] || [];
        acc[s.marker].push(s.time.tick);
      }
      return acc;
    }, {});

    state = new State(this.defaultPhraseParser, master);
    state.markers = markers;
  } else {
    state = new State(this.defaultPhraseParser);
  }

  this.events = state.initEvents;
  this.states = [state];
  this.next = undefined;
  this.process(this.parse(part));
  return {
    states: this.states,
    events: this.events
  };
}

module.exports = Interpreter;
