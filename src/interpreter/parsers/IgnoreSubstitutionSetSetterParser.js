var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var parserUtils = require('../parserUtils');

function IgnoreSubstitutionSetSetterParser() {
  this.type = 'IgnoreSubstitutionSetSetter';
  this.setter = true;
  this.master = true;
}

var prototype = {
  match: function match(s) {
    var startTest = /^\w+\#[\d]+( ?)=( ?)\(/.exec(s);
    if (!startTest) return false;
    var bracketed = parserUtils.getBracketed(s, startTest[0].length);
    this.string = startTest[0] + bracketed + ')';
    this.parsed = { type: 'substitutionset'};

    return true;
  },
  mutateState: function (state, interpreter) {
    //dont do anything
  },
  continue: true
}

IgnoreSubstitutionSetSetterParser.prototype = _.extend({}, parser, prototype);
module.exports = IgnoreSubstitutionSetSetterParser;