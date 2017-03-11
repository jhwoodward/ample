var utils = require('../parserUtils');
var _ = require('lodash');

function OctaveParser() {
  this.type = 'octave';
  this.test = /^\-?[0-4]:/;
}

OctaveParser.prototype = {
  parse: function (s) {
    return utils.parseOctave(s);
  },
  mutateState: function (state) {
    state.pitch.octave = this.parsed.octave;
    state.pitch.char = undefined;
  }
}

module.exports = OctaveParser;
