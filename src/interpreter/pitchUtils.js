
var api = {

  midiPitchFromNote: function (note, octave, accidental) {
    note = note.toLowerCase();
    var midi_letter_pitches = { a: 21, b: 23, c: 12, d: 14, e: 16, f: 17, g: 19 };
    var out = (12 * octave) + midi_letter_pitches[note];
    if (accidental) out += accidental;
    return out;
  },
  setOctave: function (state) {
    var pitch = state.pitch;
    if (pitch.char) { // TODO: set state.pitch.char to undefined when setting octave 
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
  fitToScale: function (pitch, scale) {
    var scalePitches = [];
    scale.forEach(function (note) {
      for (var oct = 0; oct <= 10; oct++) {
        scalePitches.push(api.midiPitchFromNote(note.char, oct) + note.accidental);
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
          }
          if (distToUpper > distToLower) {
            fit = lower;
          }
          //equidistant so random choice
          if (Math.floor(Math.random() * 2) == 1) {
            fit = upper;
          } else {
            fit = lower;
          }
        }
      });
    }
    return fit;
  },  
  getPitch: function (state) {
    var pitch = this.parsed.pitch;
    var value = api.midiPitchFromNote(pitch.char, state.pitch.octave);
    if (!this.parsed.natural) {
      var isFlat = pitch.flat || state.key.flats.indexOf(pitch.char.toUpperCase()) > -1;
      var isSharp = pitch.sharp || state.key.sharps.indexOf(pitch.char.toUpperCase()) > -1;
      if (isFlat) {
        value --;
      }
      if (isSharp) {
        value ++;
      }
    }
    return value + state.pitch.transpose;
  }
};

module.exports = api;