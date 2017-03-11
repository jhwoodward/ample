var utils = require('../parserUtils');
var pitchUtils = require('../pitchUtils');
var _ = require('lodash');
var eventType = require('../constants').eventType;

function KeyswitchParser() {
  this.type = 'Keyswitch';
  this.test = /^\[\-?[0-4]:[+-]?[A-G]\]/;
}
KeyswitchParser.prototype = {
  parse: function (s) {
    var note = /[+-]?[A-G]/.exec(s)[0];
    var out = Object.assign(utils.parseNote(note), utils.parseOctave(s));
    out.pitch = pitchUtils.midiPitchFromNote(out.char, out.octave, out.accidental);
    out.string += out.octave.toString();
    return out;
  },
  mutateState: function (state) {
    state.phrase.keyswitch = this.parsed;
    state.events.push({
      tick: state.time.tick,
      type: eventType.noteon,
      pitch: {value: this.parsed.pitch, string: this.parsed.string },
      keyswitch: true
    })
  }
}

module.exports = KeyswitchParser;