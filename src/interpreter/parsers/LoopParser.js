var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var eventType = require('../constants').eventType;
var utils = require('../parserUtils');

function LoopParser(macros) {
  this.type = 'Loop';
}

var prototype = {
  match: function match(s) {
    if (s[0] !== '(') return false;

    var bracketed = utils.getBracketed(s, 1);
    if (!bracketed) return false;
    var remainder = s.substring(bracketed.length + 2, s.length);
    if (!remainder.length) return false;
    var count = /^( ?)\*( ?)[\d]+/.exec(remainder);
    if (!count) return false;
    var parsed = {
      count: parseInt(count[0].replace('*', ''), 10)
    };
    parsed.part = bracketed;
    parsed.definitionStart = 1;

    this.string = '(' + bracketed + ')' + count[0],
      this.parsed = parsed;
    return true;
  },
  mutateState: function (state, interpreter) {
    var parsed, cursor;
    cursor = this.origin.start + this.parsed.definitionStart;
    parsed = interpreter.parse(this.parsed.part, cursor);
    for (var i = 0; i < this.parsed.count; i++) {
      interpreter.generateState(parsed);
    }

  },
  continue: true

}

LoopParser.prototype = _.extend({}, parser, prototype);
module.exports = LoopParser;