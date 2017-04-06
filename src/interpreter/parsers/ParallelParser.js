var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;

function ParallelParser(macros) {
  this.type = 'Parallel';

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
    var startTest = /^parallel\(/.exec(s);
    if (!startTest) return false;

    var bracketed = utils.getBracketed(s, startTest[0].length);
    var parts = bracketed.trim().split('|');

    parts.forEach(part => {
      if (this.substitutions[part]) {
        part = this.substitutions[part].value;
      } 
    });

    this.string = startTest[0] + bracketed + ')';
    this.parsed = parts;

    return true;
  },
  mutateState: function (state, interpreter) {
    var start = state.time.tick;
    this.parsed.forEach(part => {
      state.time.tick = start;
      interpreter.generateState(part.parsed);
    });
  },
  continue: true
}

SubstitutionParser.prototype = _.extend({}, parser, prototype);
module.exports = SubstitutionParser;