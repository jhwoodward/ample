var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var parserUtils = require('../parserUtils');

function SubstitutionSetSetterParser() {
  this.type = 'SubstitutionSetSetter';
  this.setter = true;
  this.master = true;

  this.test = /^\w+\#[\d]+( ?)=( ?)/;///for code highlighting only
  this.testEnd = /\)/;
}

var prototype = {
  match: function match(s) {
    var startTest = /^\w+\#[\d]+( ?)=( ?)\(/.exec(s);
    if (!startTest) return false;

    var keyTest = /^\w+/.exec(s);
    var key = keyTest[0];

    var remainder = s.substring(keyTest[0].length, s.length);
    var index = /^\#[\d]+/.exec(remainder);
    if (index) {
      index  = parseInt(index[0].replace('#', ''), 10)
    }

    var bracketed = parserUtils.getBracketed(s, startTest[0].length);
    var value = bracketed;//.trim();
    this.string = startTest[0] + bracketed + ')';
    this.parsed = { 
      type: 'substitutionset', 
      definitionStart: startTest[0].length,
      key, 
      index,
      value 
  };

    return true;
  },
  mutateState: function (state, interpreter) {
    this.parsed.definitionStart += this.origin.start;//start of token relative to doc
    this.parsed.origin = this.origin;
    interpreter.setMacro(this.parsed);
  },
  continue: true
}

SubstitutionSetSetterParser.prototype = _.extend({}, parser, prototype);
module.exports = SubstitutionSetSetterParser;