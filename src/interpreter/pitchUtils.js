var notePitches = {c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
var api = {
  midiPitchFromNote: function (note, octave, accidental) {
    note = note.toLowerCase();
    var out = (12 * octave) + notePitches[note];
    if (accidental) out += accidental;
    return out;
  },
  midiPitchToString: function(pitch, preferSharps) {
    var octave = Math.floor(pitch/12);
    var note = pitch - (12 * octave);
    var char, upper, lower, acc;
    for (var key in notePitches) {
      if (notePitches[key] === note) {
        char = key;
        break;
      }
      if (note - notePitches[key] === -1 ) {
        upper = key;
      }
      if (note - notePitches[key] === 1) {
        lower = key;
      }
    }
    if (char) {
      return char.toUpperCase() + octave.toString();
    }
    if (preferSharps) {
      return lower.toUpperCase() + '#' + octave.toString();
    }
    if (upper) {
      return upper.toUpperCase() + 'b' + octave.toString();
    }

  }
};

module.exports = api;