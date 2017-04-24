var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var parserUtils = require('../parserUtils');

function IgnoreSubstitutionSetterParser() {
  this.type = 'IgnoreSubstitutionSetter';
  this.setter = true;
  this.master = true;
}

var prototype = {
  match: function match(s) {
    var startTest = /^\(\w+\)=\(/.exec(s);
    if (!startTest) return false;

    var key = /^\(\w+\)=/.exec(s)[0].replace('(', '').replace(')', '').replace('=', '');
    var bracketed = parserUtils.getBracketed(s, startTest[0].length);
    var value = bracketed.trim();
    this.string = startTest[0] + bracketed + ')';
    this.parsed = { type: 'substitution', key, value };

    return true;
  },
  mutateState: function (state, interpreter) {
    //dont do anything
  },
  continue: true
}

IgnoreSubstitutionSetterParser.prototype = _.extend({}, parser, prototype);
module.exports = IgnoreSubstitutionSetterParser;