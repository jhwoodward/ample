var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var eventType = require('../constants').eventType;
var utils = require('../parserUtils');

function LoopParser(macros) {
  this.type = 'Loop';

  this.substitutions = {};
  if (macros) {
    this.substitutions = macros.reduce(function (acc, item) {
      if (item.type === macroType.substitution) {
        acc[item.key] = item;
      }
      return acc;
    }, {});
  }
}

var prototype = {
  match: function match(s) {
    if (s[0] !== '(') return false;

    var bracketed = utils.getBracketed(s, 1);
    var remainder = s.substring(bracketed.length + 2, s.length);
    if (!remainder.length) return false;
    var count = /^( ?)\*( ?)[\d]+/.exec(remainder);
    if (!count) return false;
    var parsed = {
      count: parseInt(count[0].replace('*', ''), 10)
    };
    var part = bracketed;//.trim();
   // if (this.substitutions[part.trim()]) {
  //    parsed.key = part.trim();
  //  } else {
      parsed.part = part;
   // }
    parsed.definitionStart = 1;

    this.string = '(' + bracketed + ')' + count[0],
      this.parsed = parsed;
    return true;
  },
  mutateState: function (state, interpreter) {
   // this.startState = _.clone(state);
    var parsed, cursor;
  /*  if (this.parsed.key) {
      var sub = this.substitutions[this.parsed.key];
      parsed = sub.parsed;
    } else {*/
      cursor = this.origin.start + this.parsed.definitionStart;
      parsed = interpreter.parse(this.parsed.part, cursor);
   // }

    for (var i = 0; i < this.parsed.count; i++) {
      interpreter.generateState(parsed);
    }
/*
    var finalState = _.cloneDeep(interpreter.getTopState());
    if (finalState.parser.next) {
      finalState.parser.next(finalState);
    }
    this.endTick = finalState.time.tick;
    */
  }/*,
  getEvents: function () {
    if (!this.parsed.key) return [];
    return [
      {
        tick: this.startState.time.tick,
        type: eventType.substitution,
        origin: this.origin //ref to string position
      },
      {
        tick: this.endTick,
        type: eventType.substitutionEnd,
        origin: this.origin 
      }
    ];
    
  }*/,
  continue: true

}

LoopParser.prototype = _.extend({}, parser, prototype);
module.exports = LoopParser;