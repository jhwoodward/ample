var pitchUtils = require('../pitchUtils');
var ArticulationParser = require('./ArticulationParser');
module.exports = {
  parseArticulation: function (s) {
    if (!this.articulations) {
      return [];
    }
    var xArray;
    var artic;
    //TODO: build dynamically from articulation keys
    var re = /[>'~_]/g;
    var out = [];
    var parser;
    while (xArray = re.exec(s)) {
      artic = xArray[0];
      if (this.articulations[artic]) {
        parser = new ArticulationParser(this.articulations[artic]);
        out.push(parser);
      }
    }
    return out;
  },
  adjustOctaveForPitchTransition: function (state) {
    if (!state.pitch.char) {
      return;
    }

    var parsedPitch = this.parsed.pitch;
    var oct = parsedPitch.octJump || 0;

    if (state.pitch.char === parsedPitch.char && (
      (parsedPitch.up === state.pitch.up) ||
      (parsedPitch.down === state.pitch.down)
    )) {
      return;
    }

    var octaveUp = state.pitch.char === parsedPitch.char && state.pitch.down && parsedPitch.up;
    var octaveDown = state.pitch.char === parsedPitch.char && state.pitch.up && parsedPitch.down;
    if (octaveUp || octaveDown) {
      if (octaveUp) {
        state.pitch.octave += oct + 1;
      }
      if (octaveDown) {
        state.pitch.octave -= oct + 1;
      }
      return;
    }

    var pitch = this.getPitch(state);
    var wouldBeHigher = pitch > state.pitch.raw;
    var wouldBeLower = pitch < state.pitch.raw;
    var shouldBeHigher = parsedPitch.up;
    var shouldBeLower = parsedPitch.down;

    if (shouldBeHigher) {
      if (wouldBeHigher) {
        state.pitch.octave += oct;
      } else if (wouldBeLower) {
        state.pitch.octave += oct + 1;
      }
    }

    if (shouldBeLower) {
      if (wouldBeLower) {
        state.pitch.octave -= oct;
      } else if (wouldBeHigher) {
        state.pitch.octave -= oct + 1;
      }
    }



  },
  // the midi pitch value for the parsed note in the state's octave
  getPitch: function (state) {
    var char = this.parsed.pitch.char;
    var value = pitchUtils.midiPitchFromNote(char, state.pitch.octave);
    if (!this.parsed.natural) {
      var isFlat = this.parsed.pitch.flat || state.key.flats.indexOf(char.toUpperCase()) > -1;
      var isSharp = this.parsed.pitch.sharp || state.key.sharps.indexOf(char.toUpperCase()) > -1;
      if (isFlat) {
        value--;
      }
      if (isSharp) {
        value++;
      }
    }
    return value + state.pitch.transpose;
  }

};