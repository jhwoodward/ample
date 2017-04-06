var _ = require('lodash');
var parser = require('./_parser');
var parserUtils = require('../parserUtils');
var pitchUtils = require('../pitchUtils');
var key = require('./_key');
var modifierType = require('../constants').modifierType;
var utils = require('../utils');

function ChordConstraintParser() {
  this.type = 'ChordConstraint';
  this.test = /^constrain:chord/;
}
 
var prototype = {
  parse: function (s) {
    return true;
  },
  mutateState: function (state, interpreter) {
    var modifier = {
      name: state.scale.name,
      type: 'chord',
      order: 100,
      fn: function constrainPitch(state) {
        state.pitch.value = pitchUtils.constrain(state.pitch.value, state.pitch.constraint.values);
      }
    };
    utils.addModifier(state, modifier);
  }
}

ChordConstraintParser.prototype = _.extend({}, parser, prototype);
module.exports = ChordConstraintParser;