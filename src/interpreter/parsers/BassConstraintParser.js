var _ = require('lodash');
var parser = require('./_parser');
var parserUtils = require('../parserUtils');
var pitchUtils = require('../pitchUtils');
var key = require('./_key');
var modifierType = require('../constants').modifierType;
var utils = require('../utils');

function BassContraintParser() {
  this.type = 'BassContraint';
  this.test = /^constrain:bass/;
}


var prototype = {
  parse: function (s) {
    return true;
  },
  mutateState: function (state, interpreter) {
    var modifier = {
      name: state.scale.name + ' - ' + state.bassline,
      type: 'bass',
      order: 50,
      fn: function constrainPitch(state) {
        state.pitch.value = pitchUtils.constrain(state.pitch.value, state.scale.scalePitches[state.bassline]);
      }
    };
    utils.addModifier(state, modifier);
   
  }
}

BassConstraintParser.prototype = _.extend({}, parser, prototype);
module.exports = BassConstraintParser;