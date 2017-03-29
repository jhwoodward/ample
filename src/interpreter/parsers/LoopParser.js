var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;

function LoopParser(macros) {
  this.type = 'Loop';
  // this.test = /^loop\(\w+,[\d]{1,3}\)/;
  //this.test = /^\(\w+\)\*[\d]{1,3}/;

 // this.test = /\(([^()]|(?R))*\)/;
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
    var nest = 1;
    var c = 1;
    var bracketed;
    while (nest > 0 && c < s.length-1) {
      
      var char = s.substring(c, c+1);
      if (char === '(') {
        nest ++;
      }
      if (char === ')') {
        nest --;
      }
      c ++;
    }

    if (nest === 0) {
      bracketed = s.substring(1, c-1);
    }
 
    var remainder = s.substring(c, s.length);

    if (!remainder.length) return false;
    if (remainder[0] !== '*') return false;

    var count = /^\*[\d]{1,3}/.exec(remainder)[0].replace('*', '');

    var parsed = {
      count: parseInt(count, 10)
    };
 
    var part = bracketed.trim();
    if (this.substitutions[part]) {
      parsed.key = part.trim();
      parsed.part = this.substitutions[part].value;
    } else {
      parsed.part = part;
    }

    this.string = '(' + bracketed + ')*' + count,
    this.parsed = parsed;
    
    return true;
  },
  mutateState: function (state, interpreter) {
    var parsed = interpreter.parse(this.parsed.part);
    for (var i = 0; i < this.parsed.count; i++) {
      interpreter.generateState(parsed);
    }
  },
  continue: true

}

LoopParser.prototype = _.extend({}, parser, prototype);
module.exports = LoopParser;