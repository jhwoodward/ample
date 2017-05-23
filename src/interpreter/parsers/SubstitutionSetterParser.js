var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var parserUtils = require('../parserUtils');

function SubstitutionSetterParser() {
  this.type = 'SubstitutionSetter';
  this.setter = true;
  this.master = true;

  this.test = /^\w+( ?)=( ?)/;///for code highlighting only
  this.testEnd = /\)/;
}

var prototype = {
  match: function match(s) {
    var startTest = /^\w+( ?)=( ?)\(/.exec(s);
    if (!startTest) return false;

    var key = /^\w+( ?)=/.exec(s)[0].replace('=', '');
    var bracketed = parserUtils.getBracketed(s, startTest[0].length);
    var value = bracketed;//.trim();
    this.string = startTest[0] + bracketed + ')';
    this.parsed = { 
      type: 'substitution', 
      definitionStart: startTest[0].length,//definition relative to start of token
      key, 
      value 
  };

    return true;
  },
  mutateState: function (state, interpreter) {
    this.parsed.definitionStart += this.origin.start;//start of token relative to doc
    interpreter.setMacro(this.parsed);
  },
  continue: true
}

SubstitutionSetterParser.prototype = _.extend({}, parser, prototype);
module.exports = SubstitutionSetterParser;