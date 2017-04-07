var _ = require('lodash');
var parser = require('./_parser');
var parserUtils = require('../parserUtils');
var pitchUtils = require('../pitchUtils');
var key = require('./_key');
var modifierType = require('../constants').modifierType;
var utils = require('../utils');

function BassConstraintParser() {
  this.type = 'BassConstraint';
  this.test = /^constrain:bass/;
}


var prototype = {
  parse: function (s) {
    return true;
  },
  mutateState: function (state, interpreter) {
    var modifier = {
      id: this.type,
      type: 'pitch',
      order: 50,
      fn: function constrainPitch(currentState) {
        if (currentState.bassline) {
          currentState.pitch.value = pitchUtils.constrain(currentState.pitch.value, currentState.scale.scalePitches[currentState.bassline]);
          return currentState.scale.name + ' - ' + currentState.bassline;
        }
      }
    };
    utils.addModifier(state, modifier);

  }
}

BassConstraintParser.prototype = _.extend({}, parser, prototype);
module.exports = BassConstraintParser;