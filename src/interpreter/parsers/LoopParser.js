var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
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
    if (remainder[0] !== '*') return false;
    var count = /^\*[\d]+/.exec(remainder)[0].replace('*', '');
    var parsed = {
      count: parseInt(count, 10)
    };
    var part = bracketed;//.trim();
    if (this.substitutions[part]) {
      parsed.key = part;
      parsed.part = this.substitutions[part].value;
    } else {
      parsed.part = part;
    }
    parsed.definitionStart = 1;
    
    this.string = '(' + bracketed + ')*' + count,
    this.parsed = parsed;
    return true;
  },
  mutateState: function (state, interpreter) {
    var cursor = this.origin.start + this.parsed.definitionStart;
    var parsed = interpreter.parse(this.parsed.part, cursor);
    for (var i = 0; i < this.parsed.count; i++) {
      interpreter.generateState(parsed);
    }
  },
  continue: true

}

LoopParser.prototype = _.extend({}, parser, prototype);
module.exports = LoopParser;