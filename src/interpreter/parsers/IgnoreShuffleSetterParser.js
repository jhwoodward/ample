var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var parserUtils = require('../parserUtils');

function IgnoreShuffleSetterParser() {
  this.type = 'IgnoreShuffleSetter';
  this.test = /^\w+( ?)=( ?)shuffle \w+/;
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

IgnoreShuffleSetterParser.prototype = _.extend({}, parser, prototype);
module.exports = IgnoreShuffleSetterParser;