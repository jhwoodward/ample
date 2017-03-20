var utils = require('../parserUtils');
var pitchUtils = require('../pitchUtils');
var _ = require('lodash');
var eventType = require('../constants').eventType;
var parser = require('./_parser');


function KeyswitchParser() {
  this.type = 'Keyswitch';
  this.test = /^\[\-?[0-4]:[+-]?[A-G]\]/;
}
var prototype = {
  parse: function (s) {
    var note = /[+-]?[A-G]/.exec(s)[0];
    var pitch = utils.parseNote(note);
    pitch.octave = utils.parseOctave(s).octave;
    pitch.value = pitchUtils.midiPitchFromNote(pitch.char, pitch.octave, pitch.accidental);
    pitch.string += pitch.octave.toString();
    return pitch;
  },
  mutateState: function (state) {
    state.phrase.keyswitch = this.parsed;
    var duration = 1;
    state.events.push({
      tick: state.time.tick,
      type: eventType.noteon,
      pitch: this.parsed,
      keyswitch: true
    });
    state.events.push({
      tick: state.time.tick + duration,
      type: eventType.noteoff,
      pitch: this.parsed,
      keyswitch: true,
      duration
    });
  }
}
KeyswitchParser.prototype = _.extend({}, parser, prototype);
module.exports = KeyswitchParser;