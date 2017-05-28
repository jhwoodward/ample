var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var parserUtils = require('../parserUtils');

function IgnoreReverseSetterParser() {
  this.type = 'IgnoreReverseSetter';
  this.test = /^\w+( ?)=( ?)reverse \w+/;
}

var prototype = {
  parse: function(){
    return {};
  },
  mutateState: function (state, interpreter) {
    //dont do anything
  },
  continue: true
}

IgnoreReverseSetterParser.prototype = _.extend({}, parser, prototype);
module.exports = IgnoreReverseSetterParser;