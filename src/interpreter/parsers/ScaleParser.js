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
    return parserUtils.parseNotes(s);
  },
  mutateState: function (state) {
    state.scale = this.parsed;

    var modifier = {
      id: this.type,
      type: modifierType.pitch,
      fn: fitPitchToScale
    };

    utils.addModifier(state, modifier, !!this.parsed.length);

    function fitPitchToScale(state) {
      var scale = state.scale;
      var pitch = state.pitch.value;
      var scalePitches = [];
      scale.forEach(function (note) {
        for (var oct = 0; oct <= 10; oct++) {
          scalePitches.push(pitchUtils.midiPitchFromNote(note.char, oct) + note.accidental);
        }
      });
      scalePitches.sort(function (a, b) {
        return a < b ? -1 : 1;
      });

      var fit;
      if (scalePitches.indexOf(pitch) > -1) {
        fit = pitch;
      } else {
        scalePitches.forEach(function (p, i) {
          if (p > pitch && !fit) {
            var upper = p;
            var lower = scalePitches[i - 1];
            var distToUpper = upper - pitch;
            var distToLower = pitch - lower;
            if (distToUpper < distToLower) {
              fit = upper;
            } else if (distToUpper > distToLower) {
              fit = lower;
            } else {
              //equidistant so random choice
              if (Math.floor(Math.random() * 2) == 1) {
                fit = upper;
              } else {
                fit = lower;
              }
            }

          }
        });
      }
      state.pitch.value = fit;
    }
  }
}

ScaleParser.prototype = _.extend({}, parser, prototype);
module.exports = ScaleParser;