var utils = require('./utils');

function OctaveParser() {
  this.type = 'octave';
  this.test = /^\-?[0-4]:/;
}

OctaveParser.prototype = {
  parse: function (s) {
    return utils.parseOctave(s);
  },
  process: function (state) {
    state.pitch.octave = this.parsed.octave;
  }
}

module.exports = OctaveParser;
