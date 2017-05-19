var _ = require('lodash');
var parser = require('./_parser');
var parserUtils = require('../parserUtils');
var pitchUtils = require('../pitchUtils');
var key = require('./_key');
var modifierType = require('../constants').modifierType;
var utils = require('../utils');

function ChordConstraintParser() {
  this.type = 'ChordConstraint';
  this.test = /^constrain( ?)chord/;
}
 
var prototype = {
  parse: function (s) {
    return true;
  },
  mutateState: function (state, interpreter) {
    var modifier = {
      id: this.type,
      type: 'pitch',
      order: 100,
      fn: function constrainPitch(currentState) {
        currentState.pitch.value = pitchUtils.constrain(currentState.pitch.value, currentState.scale.chordConstraint);
        return currentState.scale.name;
      }
    };
    utils.addModifier(state, modifier);
  }
}

ChordConstraintParser.prototype = _.extend({}, parser, prototype);
module.exports = ChordConstraintParser;