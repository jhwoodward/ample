var pitchUtils = require('../pitchUtils');

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
    while (xArray = re.exec(s)) {
      artic = xArray[0];
      if (this.articulations[artic]) {
        out.push(this.articulations[artic]);
      }
    }
    return out;
  },
  adjustOctaveForPitchTransition: function (state, prev) {
    if (!prev.pitch.char) {
      return;
    }

    var parsedPitch = this.parsed.pitch;
    var oct = parsedPitch.octJump || 0;

    if (prev.pitch.char === parsedPitch.char && parsedPitch.up === prev.pitch.up ) {
      return;
    }

    var octaveUp = prev.pitch.char === parsedPitch.char && prev.pitch.down && parsedPitch.up;
    var octaveDown = prev.pitch.char === parsedPitch.char && prev.pitch.up && parsedPitch.down;
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
    var wouldBeHigher = pitch > prev.pitch.raw;
    var wouldBeLower = pitch < prev.pitch.raw;
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