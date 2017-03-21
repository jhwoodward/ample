var parserUtils = require('../parserUtils');
var pitchUtils = require('../pitchUtils');
var utils = require('../utils');
var _ = require('lodash');
var parser = require('./_parser');
var modifierType = require('../constants').modifierType;

function ScaleParser() {
  this.type = 'Scale';
  this.test = /^S\((?:[+-]?[A-G])+\)S/;
}

var prototype = {
  parse: function (s) {
    var notes = parserUtils.parseNotes(s);
    return pitchUtils.allPitches(notes);
  },
  mutateState: function (state) {
    state.pitch.constraint = this.parsed;

    var modifier = {
      id: this.type,
      type: modifierType.pitch,
      fn: function constrainPitch(state) {
        state.pitch.value = pitchUtils.constrain(state.pitch.value, state.pitch.constraint);
      }
    };

    utils.addModifier(state, modifier, !!this.parsed.length);
  }
}

ScaleParser.prototype = _.extend({}, parser, prototype);
module.exports = ScaleParser;