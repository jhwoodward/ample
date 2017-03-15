var parsers = require('./parsers');
var parserUtils = require('./parserUtils');
var utils = require('./utils');
var State = require('./State');
var macroType = require('./constants').macroType;
var _ = require('lodash');

function Interpreter(macros) {
  this.macros = macros || [];

  var initPhrase =  '8192=P 85=C1';
  if (!this.macros.filter(m=>m.type===macroType.annotation && m.key==='default').length) {
    this.macros.push({
      type: macroType.annotation,
      key: 'default',
      value: initPhrase
    });
  }

  var interpretedMacro;
  this.macros.forEach(macro => {
    switch (macro.type) {
      case macroType.substitution:
        macro.parsed = this.parse(macro.value);
        break;
      case macroType.annotation:
        var interpretedMacro = this.interpret(macro.value);
        macro.parsed = parserUtils.strip(interpretedMacro.finalState.phrase);
        delete macro.parsed.pitch;
        if (macro.key === 'default') {
          var initEvents = utils.eventsFromStates(interpretedMacro.states);
          initEvents.map(e => e.tick = 0);
          this.initState = {
            phrase: macro.parsed,
            events: initEvents
          };
        } 
        break;
      case macroType.articulation:
        macro.parsed = parserUtils.strip(this.interpret(macro.value).finalState.phrase);
        delete macro.parsed.pitch;
    }
  });

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

  parsers.forEach(function (parser, i) {

    var state = this.state.clone();

    if (i > 0 && parsers[i - 1].leave) {
      parsers[i - 1].leave(this.state, state);
    }
    /*
    if (parser.type === 'Macro' && this.macros[parser.parsed.id]) {
      if (this.state.context.length < 10) {
        this.state.context.push(parser.parsed.id);
        this.process(this.macros[parser.parsed.id]);
        this.state.context.pop();
      }
    } else {
     
    }*/
    parser.mutateState(state);

    if (parser.enter) {
      parser.enter(state, this.state);
    }
    this.state = state;
    this.states.push(this.state);
  }.bind(this));
}

Interpreter.prototype.interpret = function (part) {
  this.state = new State(this.initState);
  this.states = [this.state];
  this.state.context = ['root'];
  this.process(this.parse(part));
  return {
    states: this.states,
    finalState: this.state
  };
}

module.exports = Interpreter;
