var _ = require('lodash');
var parser = require('./_parser');
var utils = require('../parserUtils');
var macroType = require('../constants').macroType;

function MarkerReadParser(macros) {
  this.type = 'MarkerRead';

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
    var startTest = /^\$[a-zA-Z]+(\d+)?\(/.exec(s);
    if (!startTest) return false;

    var markerNameTest = /[a-zA-Z]+/.exec(startTest[0]);
    var name = markerNameTest[0];
    var n = /\d+/.exec(startTest[0]);
    n = n ? parseInt(n[0]) : undefined;

    var nest = 1;
    var c = startTest[0].length;
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
      bracketed = s.substring(startTest[0].length, c - 1);
    }

    var parsed = { name, n };

    var part = bracketed.trim();
    if (this.substitutions[part]) {
      parsed.key = part.trim();
      parsed.part = this.substitutions[part].value;
    } else {
      parsed.part = part;
    }

    this.string = startTest[0] + bracketed + ')';
    this.parsed = parsed;

    return true;
  },
  mutateState: function (state, interpreter) {
    if (!state.isMaster) {

      var origTick = state.time.tick;

      var part = interpreter.parse(this.parsed.part);

      state.markers[this.parsed.name].forEach((tick,i) => {
        if (!this.parsed.n) {
          interpreter.next = interpreter.getNextState();
          interpreter.next.time.tick = tick;
          interpreter.process(part);
        } else if (i === this.parsed.n-1) {
          interpreter.next = interpreter.getNextState();
          interpreter.next.time.tick = tick;
          interpreter.process(part);
        }
 
      });

      state.time.tick = origTick;
    }

  },
  continue: true

}
MarkerReadParser.prototype = _.extend({}, parser, prototype);
module.exports = MarkerReadParser;