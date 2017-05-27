var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var parserUtils = require('../parserUtils');

function ShuffleSetterParser() {
  this.type = 'ShuffleSetter';
  this.setter = true;
  this.master = true;


  this.test = /^\w+( ?)=( ?)shuffle( ?)\w+/;

}

var prototype = {
  parse: function parse(s) {
    var startTest = /^\w+( ?)=( ?)/.exec(s);

    var key = /^\w+( ?)=/.exec(s)[0].replace('=', '').trim();
    var value = /shuffle( ?)\w+/.exec(s)[0].replace('shuffle', '').trim();

    return {
      type: 'shuffle',
      definitionStart: startTest[0].length,//definition relative to start of token
      key,
      value
    };

  },
  mutateState: function (state, interpreter) {
    this.parsed.definitionStart += this.origin.start;//start of token relative to doc
    interpreter.setMacro(this.parsed);
  },
  continue: true
}

ShuffleSetterParser.prototype = _.extend({}, parser, prototype);
module.exports = ShuffleSetterParser;