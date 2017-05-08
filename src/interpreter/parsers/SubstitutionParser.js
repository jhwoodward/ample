var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var eventType = require('../constants').eventType;

function SubstitutionParser(macros) {
  this.type = 'Substitution';
  this.test = /^\(\w+\)(?!=)/;
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
  parse: function (s) {
    var key = /\w+/.exec(s)[0];
    if (this.substitutions[key]) {
      return key;
    }
  },
  mutateState: function (state, interpreter) {
    this.startState = _.clone(state);
    var sub = this.substitutions[this.parsed];
    interpreter.generateState(sub.parsed);
    var finalState = _.cloneDeep(interpreter.getTopState());
    if (finalState.parser.next) {
      finalState.parser.next(finalState);
    }
    this.endTick = finalState.time.tick;
  },
  getEvents: function () {
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
    
  },
  continue: true
}

SubstitutionParser.prototype = _.extend({}, parser, prototype);
module.exports = SubstitutionParser;