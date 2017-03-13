var utils = require('../parserUtils');
var _ = require('lodash');
var parser = require('./_parser');

function OctaveParser() {
  this.type = 'Octave';
  this.test = /^\-?[0-4]:/;
}

var prototype = {
  parse: function (s) {
    return utils.parseOctave(s);
  },
  mutateState: function (state) {
    state.pitch.octave = this.parsed.octave;
    state.pitch.char = undefined;
  }
}

OctaveParser.prototype = _.extend({}, parser, prototype);

module.exports = OctaveParser;
