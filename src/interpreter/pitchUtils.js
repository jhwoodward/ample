var notePitches = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
var api = {
  midiPitchFromNote: function (note, octave, accidental) {
    note = note.toLowerCase();
    var out = (12 * octave) + notePitches[note];
    if (accidental) out += accidental;
    return out;
  },
  midiPitchToString: function (pitch, preferSharps) {
    var octave = Math.floor(pitch / 12);
    var note = pitch - (12 * octave);
    var char, upper, lower, acc;
    for (var key in notePitches) {
      if (notePitches[key] === note) {
        char = key;
        break;
      }
      if (note - notePitches[key] === -1) {
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
  },
  midiPitchToStringNoOctave: function (pitch) {
    var octave = Math.floor(pitch / 12);
    var note = pitch - (12 * octave);
    var char, upper, lower, acc;
    for (var key in notePitches) {
      if (notePitches[key] === note) {
        char = key;
        break;
      }
      if (note - notePitches[key] === -1) {
        upper = key;
      }
      if (note - notePitches[key] === 1) {
        lower = key;
      }
    }
    if (char) {
      return [char.toUpperCase(), char.toUpperCase()];
    }
    return [lower.toUpperCase() + '#', upper.toUpperCase() + 'b'];
  },
  allPitches: function (notes) {
    var pitches = [];
    notes.forEach(function (note) {
      for (var oct = 0; oct <= 10; oct++) {
        pitches.push(api.midiPitchFromNote(note.char, oct, note.accidental));
      }
    });
    pitches.sort(function (a, b) {
      return a < b ? -1 : 1;
    });
    return pitches;
  },
  constrain: function (pitch, constraint) {
    var fit;
    if (constraint.indexOf(pitch) > -1) {//!constraint || constraint.length === 0 || 
      return pitch;
    }
    constraint.forEach(function (p, i) {
      if (p > pitch && !fit) {
        var upper = p;
        var lower = constraint[i - 1];
        var distToUpper = upper - pitch;
        var distToLower = pitch - lower;
        if (distToUpper < distToLower) {
          fit = upper;
        } else if (distToUpper > distToLower) {
          fit = lower;
        } else {
          //equidistant so random choice
          if (Math.floor(Math.random() * 2) == 1) {
            fit = upper;
          } else {
            fit = lower;
          }
        }
      }
    });
    return fit;
  }


};

module.exports = api;