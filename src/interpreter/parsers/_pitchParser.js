var pitchUtils = require('../pitchUtils');

module.exports = {
  parseArticulation: function(s) {
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
        out.push({
          key: artic,
          parsed: this.articulations[artic]
        });
      }
    }
    return out;
  },
  setOctave: function (state) {
    var pitch = state.pitch;
    if (pitch.char) { 
      var nextPitch = this.getPitch(state);
      var wouldBeSameOrHigher = nextPitch >= pitch.raw;
      var wouldBeSameOrLower = nextPitch <= pitch.raw;
      var wouldBeHigher = nextPitch > pitch.raw;
      var wouldBeLower = nextPitch < pitch.raw;

      if (this.parsed.up) {
        if (this.parsed.octJump) {
          if (wouldSameBeHigher) {
            pitch.octave -= this.parsed.octJump;
          }
        } else {
          var octaveUp = pitch.char === this.parsed.char.toUpperCase();
          if (wouldBeHigher || (octaveUp && pitch.sharp)) {
            pitch.octave -= 1;
          }
        }
      }
      if (this.parsed.down) {
        if (this.parsed.octJump) {
          if (wouldBeSameOrLower) {
            pitch.octave += this.parsed.octJump;
          }
        } else {
          var octaveDown = pitch.char === this.parsed.char.toLowerCase();
          if (wouldBeLower || octaveDown && pitch.flat) {
            pitch.octave += 1;
          }
        }
      }

    } else {
      if (this.parsed.down) {
        pitch.octave--;
      }
    }

  },
  getPitch: function (state) {
    var pitch = this.parsed.pitch;
    var value = pitchUtils.midiPitchFromNote(pitch.char, state.pitch.octave);
    if (!this.parsed.natural) {
      var isFlat = pitch.flat || state.key.flats.indexOf(pitch.char.toUpperCase()) > -1;
      var isSharp = pitch.sharp || state.key.sharps.indexOf(pitch.char.toUpperCase()) > -1;
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