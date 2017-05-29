var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var eventType = require('../constants').eventType;
var parserUtils = require('../parserUtils');
var SubInterpreter = require('../SubInterpreter');

function ReverseParser(macros) {
  this.type = 'reverse';
  this.test = /^reverse/; ///for code highlighting only
}


function generateState(initialState, parsers, interpreter) {
  var subInterpreter = new SubInterpreter(initialState);
  subInterpreter.parse = function(part, cursor) {
    return interpreter.parse(part, cursor);
  }
  subInterpreter.generateState(parsers);
  return subInterpreter.states;
}

var prototype = {
  match: function match(s) {
    var startTest = /^reverse\(/.exec(s);
    if (!startTest) return false;
    var bracketed = parserUtils.getBracketed(s, startTest[0].length);
    this.parsed = {
      part: bracketed,
      definitionStart: startTest[0].length
    };
    this.string = startTest[0] + bracketed + ')';
    return true;
  },
  parse: function (s) {
    var key = /\w+/.exec(s)[0];
    if (this.reversals[key]) {
      return key;
    }
  },
  mutateState: function (state, interpreter) {

    var initialState = interpreter.next || interpreter.getNextState();
    var states = generateState(initialState, interpreter.parse(this.parsed.part), interpreter);

    this.startTick = states[0].time.tick;
    states.reverse();
    states[0].time.tick = this.startTick;
    states.forEach((s, i) => {
      if (i > 0) {
        var prev = states[i - 1];
        s.time.tick = prev.time.tick;
        if (prev.parser.duration) {
          s.time.tick += prev.parser.duration;
        }
      }
    });

    interpreter.appendState(states);

    var finalState = _.cloneDeep(interpreter.getTopState());
    if (finalState.parser.next) {
      finalState.parser.next(finalState);
    }
    this.endTick = finalState.time.tick;

    //  transpose, reorder, set to another rhythm etc




  },
  getEvents: function () {
    return [
      {
        tick: this.startTick,
        type: eventType.substitution,
        origin: this.origin //ref to string position
      },
      {
        tick: this.endTick,
        type: eventType.substitutionEnd,
        origin: this.origin
      }
    ];

  },
  continue: true
}

ReverseParser.prototype = _.extend({}, parser, prototype);
module.exports = ReverseParser;