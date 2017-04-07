var _ = require('lodash');
var parser = require('./_parser');
var parserUtils = require('../parserUtils');
var pitchUtils = require('../pitchUtils');
var key = require('./_key');
var modifierType = require('../constants').modifierType;
var utils = require('../utils');

function MasterBassParser() {
  this.type = 'MasterBass';
  this.test = /^bass:[\d+]/;
}


var prototype = {
  parse: function (s) {
    var bass = parseInt(s.replace('bass:',''),10);
    return bass;
  },
  mutateState: function (state, interpreter) {
    if (interpreter.isMaster) {
      state.bassline = this.parsed;
    }
  }
}

MasterBassParser.prototype = _.extend({}, parser, prototype);
module.exports = MasterBassParser;