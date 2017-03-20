var _ = require('lodash');
var parser = require('./_parser');
var utils = require('../parserUtils');
var macroType = require('../constants').macroType;

function MarkerReadParser(macros) {
  this.type = 'MarkerRead';
  this.test = /^\$\w+/;

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
    var start = /^\$\w+\(/;
    var nameTest = start.exec(s);
    if (!nameTest) return false;
    var name = nameTest[0].replace('(', '').replace('$','');

    var nest = 1;
    var c = nameTest[0].length;
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
      bracketed = s.substring(nameTest[0].length, c - 1);
    }

    var parsed = {
      name
    };

    var part = bracketed.trim();
    if (this.substitutions[part]) {
      parsed.key = part.trim();
      parsed.part = this.substitutions[part].value;
    } else {
      parsed.part = part;
    }

    this.string = nameTest[0] + bracketed + ')';
    this.parsed = parsed;

    return true;
  },
  mutateState: function (state, interpreter) {
    if (!state.isMaster) {

      var origTick = state.time.tick;

      var parsed = interpreter.parse(this.parsed.part);
      
      state.markers[this.parsed.name].forEach(tick => {
        interpreter.next = interpreter.getNextState();
        interpreter.next.time.tick = tick;
        interpreter.process(parsed);
      });

      state.time.tick = origTick;
    }

  },
  continue: true

}
MarkerReadParser.prototype = _.extend({}, parser, prototype);
module.exports = MarkerReadParser;