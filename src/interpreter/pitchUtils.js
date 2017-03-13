
var api = {
  midiPitchFromNote: function (note, octave, accidental) {
    note = note.toLowerCase();
    //var midi_letter_pitches = { a: 21, b: 23, c: 12, d: 14, e: 16, f: 17, g: 19 };
    var midi_letter_pitches = {c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
    var out = (12 * octave) + midi_letter_pitches[note];
    if (accidental) out += accidental;
    return out;
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
  }
};

module.exports = api;