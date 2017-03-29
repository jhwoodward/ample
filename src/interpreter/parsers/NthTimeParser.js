var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;

function NthTimeParser(macros) {
  this.type = 'NthTime';

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
    var start = /^[\d]{1,3}\(/;
    var ntest = start.exec(s);
    if (!ntest) return false;
    var n = parseInt(ntest[0].replace('(', ''), 10);

    var nest = 1;
    var c = ntest[0].length;
    var bracketed;
    while (nest > 0 && c < s.length) {
      var char = s.substring(c, c + 1);
      if (char === '(') {
        nest++;
      }
      if (char === ')') {
        nest--;
      }
      c++;
    }

    if (nest === 0) {
      bracketed = s.substring(ntest[0].length, c - 1);
    }

    var parsed = {
      n
    };

    var part = bracketed.trim();
    if (this.substitutions[part]) {
      parsed.key = part.trim();
      parsed.part = this.substitutions[part].value;
    } else {
      parsed.part = part;
    }

    this.string = ntest[0] + bracketed + ')';
    this.parsed = parsed;

    return true;
  },
  mutateState: function (state, interpreter) {

    state.nthTimeTracker = state.nthTimeTracker || {};

    if (!state.nthTimeTracker[this.string]) {
      state.nthTimeTracker[this.string] = 1;
    } else {
      state.nthTimeTracker[this.string] ++;
    }

    if (state.nthTimeTracker[this.string] === this.parsed.n) {
      var parsed = interpreter.parse(this.parsed.part);
      interpreter.generateState(parsed);
    }

  },
  continue: true

}

NthTimeParser.prototype = _.extend({}, parser, prototype);
module.exports = NthTimeParser;