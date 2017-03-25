var parsers = require('./parsers');
var parserUtils = require('./parserUtils');
var utils = require('./utils');
var State = require('./State');
var macroType = require('./constants').macroType;
var AnnotationParser = require('./parsers/AnnotationParser');
var _ = require('lodash');

function Interpreter(macros) {
  this.macros = macros || [];
  this.macros.forEach(macro => { macro.parsed = this.parse(macro.value);});

  var hasDefaultPhrase = this.macros.filter(m => {
    return m.type === macroType.annotation && m.key === 'default';
  }).length;
  if (!hasDefaultPhrase) {
    var defaultPhrase = '8192=P 85=C1 90=V 0=ON -5=OFF';
    this.macros.push({
      type: macroType.annotation,
      key: 'default',
      value: defaultPhrase,
      parsed: this.parse(defaultPhrase)
    });
  }
  this.defaultPhrase = this.macros.filter(m => {
    return m.type === macroType.annotation && m.key === 'default';
  })[0];
}

/*
  Returns an array of parsers who's regex's match the part string
*/
Interpreter.prototype.parse = function (part) {
  var parsers = [], parser;
  var cursor = 0;
  while (part.length && parsers.length < 9999999) {
    parser = this.findMatch(part);
    if (parser) {
      parsers.push(parser);
      part = part.substring(parser.string.length, part.length);
    } else {
      parsers.push(null);
      part = part.substring(1, part.length)
    }
  }
  return parsers.filter(a => !!a);
}

/*
  Returns the first parser who's regex matchs the part string
*/
Interpreter.prototype.findMatch = function (part) {
  var result, parser;
  for (var i = 0; i < parsers.length; i++) {
    parser = new parsers[i](this.macros);
    result = parser.match(part);
    if (result) {
      break;
    }
  }
  if (!result) return undefined;
  return parser;
}

Interpreter.prototype.process = function (parsers) {

  for (var i = 0; i < parsers.length; i++) {
    var parser = parsers[i];

    var state = this.next || this.getNextState();

    state.mutateFromMaster();

    parser.mutateState(state, this);
    state.mutater = parser.type + ' (' + parser.string + ')';

    if (parser.getEvents) {
      var events = parser.getEvents(state, this.getTopState());
      this.events = this.events.concat(events);
    }

    if (parser.continue) {
      continue;
    }

    this.states.push(state);

    this.next = this.getNextState();
    if (parser.leave) {
      parser.leave(state, this.next);
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
    this.process(this.parse(master));

    //take only the final state for each tick;
    master = this.states.reduce((acc, s) => {
      var tick = s.time.tick;
      if (acc.filter(m => { return m.tick === tick}).length) return acc;
      var tickStates = this.states.filter(x => { return x.time.tick === tick; });
      var lastTickState = tickStates[tickStates.length-1];
      var m = { 
        tick: tick, 
        state: {
          key: lastTickState.key, 
          pitch: { constraint: lastTickState.pitch.constraint },
          modifiers: lastTickState.modifiers,
          mutater: lastTickState.mutater,
          time: { tempo: lastTickState.time.tempo } } 
      };
      acc.push(m);
      return acc;
    },[]);

    markers = this.states.reduce((acc, s) => {
      if (s.marker) {
        acc[s.marker] = acc[s.marker] || [];
        acc[s.marker].push(s.time.tick);
      }
      return acc;
    },{});

    state = new State(master);
    state.markers = markers;
  } else {
    state = new State();
  }

  var next = state.clone();

  var defaultPhraseParser = new AnnotationParser();
  defaultPhraseParser.parsed = this.defaultPhrase;
  defaultPhraseParser.mutateState(next);
  var initEvents = defaultPhraseParser.getEvents(next, state);
  initEvents.forEach(e => {
    e.tick = 10 + (e.offset || 0);
  });
  this.events = initEvents;
  this.states = [state, next];
  this.next = undefined;
  this.process(this.parse(part));
  return {
    states: this.states,
    events: this.events
  };
}

module.exports = Interpreter;
