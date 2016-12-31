var utils = require('jsmidgen').Util;

function isNote(char) {
  var notes = 'abcdefgABCDEFG';
  return notes.indexOf(char) > -1;
}

function isRest(char) {
  return char === '^';
}

function isSustain(char) {
  return char === '/';
}

function isIgnore(char) {
  return char === ' ';
}

function fitToScale(pitch, scale) {

  if (scale.length) {
    var scalePitches = [];
    scale.forEach(function (note) {
      var acc = 0;
      var isSharp = note[0] === '+';
      var isFlat = note[0] === '-';
      if (isSharp) {
        acc = 1;
      }
      if (isFlat) {
        acc = -1;
      }
      noteWithoutAccidental = note.length > 1 ? note[1] : note[0];
      for (var oct = 0; oct <= 10; oct++) {
        scalePitches.push(utils.midiPitchFromNote(noteWithoutAccidental + oct) + acc);
      }
    });
    scalePitches.sort(function (a, b) {
      return a < b ? -1 : 1;
    });

    var fittedNote;
    if (scalePitches.indexOf(pitch) > -1) {
      fittedNote = pitch;
    } else {

      scalePitches.forEach(function (p, i) {

        if (p > pitch && !fittedNote) {
          var upper = p;
          var lower = scalePitches[i - 1];
          var distToUpper = upper - pitch;
          var distToLower = pitch - lower;
          if (distToUpper < distToLower) {
            fittedNote = upper;
          }
          if (distToUpper > distToLower) {
            fittedNote = lower;
          }
          //equidistant so random choice
          if (Math.floor(Math.random() * 2) == 1) {
            fittedNote = upper;
          } else {
            fittedNote = lower;
          }

        }
      });

    }
    return fittedNote;

  } else {
    return pitch;
  }
}

function getPitch(char, octave, accidental, natural, sharps, flats, transpose) {
  var pitch = utils.midiPitchFromNote(char + octave);
  var isFlat = accidental === -1 || flats.indexOf(char.toUpperCase()) > -1;
  var isSharp = accidental === 1 || sharps.indexOf(char.toUpperCase()) > -1
  if (isFlat) {
    pitch -= 1;
  }
  if (isSharp) {
    pitch += 1;
  }
  return pitch + transpose;
}

function isUpperCase(char) {
  return char === char.toUpperCase();
}

function isPling(char) {
  return char === '!';
}

function isLowerCase(char) {
  return char === char.toLowerCase();
}

function isComma(char) {
  return char === ',';
}

function isStaccato(char) {
  return char === '\'';
}

function isAccent(char) {
  return char === '>';
}

function isColon(char) {
  return char === ':';
}

function isSharp(char) {
  return char === '+';
}

function isFlat(char) {
  return char === '-';
}

function isTranspose(char) {
  return char === '@';
}

function isNatural(char) {
  return char === '=';
}

function isRelativePitch(char) {
  return char === '_';
}

function isStartKeySignature(chars) {
  return chars === 'K(';
}

function isSetTempo(chars) {
  return chars === '=T';
}

function isEndKeySignature(chars) {
  return chars === ')K';
}

function isStartScaleSignature(chars) {
  return chars === 'S(';
}

function isEndScaleSignature(chars) {
  return chars === ')S';
}

function send(playerId, s, startBeat) {

  var lastNote, lastRest;
  startBeat = startBeat || 1;
  var beatCount = 0;
  var beatStep = 48;
  var octave = 4;
  var transpose = 0;
  var plingCount = 0;
  var numbers = [];
  var char;
  var octaveReset = false;
  var accidental = 0; //sharp or flat / +1 / -1
  var natural = false;
  var baseVelocity = 80;
  var velocity = baseVelocity;
  var velocityStep = 10;
  var staccato;
  var settingKeySignature = false;
  var settingScaleSignature = false;
  var tempo = 120;
  var flats = [], sharps = [], scale = []; // for key sig

  for (var i = 0; i < s.length; i++) {

    if (isIgnore(s[i])) {
      ensureLastNoteSent();
      continue;
    }

    char = s[i];

    if (i < s.length - 1) {
      char2 = s[i + 1];
    } else {
      char2 = '';
    }
    if (isStartKeySignature(char + char2)) {
      settingKeySignature = true;
      flats = []; sharps = []; omit = [];
      i += 1; continue;
    }
    if (isEndKeySignature(char + char2)) {
      settingKeySignature = false;
      i += 1; continue;
    }

    if (isStartScaleSignature(char + char2)) {
      settingScaleSignature = true;
      scale = [];
      i += 1; continue;
    }
    if (isEndScaleSignature(char + char2)) {
      settingScaleSignature = false;
      i += 1; continue;
    }

    if (isSetTempo(char + char2)) {
      tempo = parseInt(numbers.join(''), 10);
      sendTempo(playerId, tempo);
      numbers = [];
      i += 1; continue;
    }

    if (settingKeySignature) {
      //expect 2 characters per accidental, eg -B -A = f major
      if (isFlat(char)) {
        flats.push(char2.toUpperCase());
        i += 1; continue;
      }
      if (isSharp(char)) {
        sharps.push(char2.toUpperCase());
        i += 1; continue;
      }
    }

    if (settingScaleSignature) {
      if (isFlat(char) || isSharp(char)) {
        scale.push(char + char2.toUpperCase());
        i += 1;
      } else {
        scale.push(char.toUpperCase());
      }
      continue;
    }

    var rest = isRest(char);// || omit.indexOf(char.toUpperCase()) > -1;
    var note = isNote(char) && !rest;

    if ((note || rest || isRelativePitch(char)) && lastNote && !lastNote.sent) {
      sendNote(playerId, lastNote);
    }

    if (isNote(char)) {
      if (lastNote) {
        //var pitchBeforeOctaveAdjustment = fitToScale(getPitch(char, octave, accidental, natural, sharps, flats, transpose), scale);
        var pitchBeforeOctaveAdjustment = getPitch(char, octave, accidental, natural, sharps, flats, transpose);
        if (!octaveReset) {
          if (isLowerCase(char)) {
            //down
            if (plingCount) {
              if (pitchBeforeOctaveAdjustment >= lastNote.pitchBeforeFit) {
                octave -= plingCount;
              }
            } else {
              if (pitchBeforeOctaveAdjustment > lastNote.pitchBeforeFit ||
                lastNote.char === char.toUpperCase() && accidental >= 0) {
                octave -= 1;
              }
            }
          }
          if (isUpperCase(char)) {
            //up
            if (plingCount) {
              if (pitchBeforeOctaveAdjustment <= lastNote.pitchBeforeFit) {
                octave += plingCount;
              }
            } else {
              if (pitchBeforeOctaveAdjustment < lastNote.pitchBeforeFit ||
                lastNote.char === char.toLowerCase() && accidental <= 0) {
                octave += 1;
              }
            }
          }
        }
      }
      if (octaveReset) {
        if (isLowerCase(char)) {
          octave -= 1;
        }
        octaveReset = false;
      }

    }

    var pitch, pitchToScale, fittedToScale;
    if (note) {
      pitch = getPitch(char, octave, accidental, natural, sharps, flats, transpose);
    }
    if (isRelativePitch(char)) {
      pitch = lastNote.pitch + accidental;
    }
    if (note || isRelativePitch(char)) {
      pitchToScale = fitToScale(pitch, scale);
      fittedToScale = pitchToScale !== pitch;
      if (fittedToScale) {
        console.log(utils.noteFromMidiPitch(pitch) + '->' + utils.noteFromMidiPitch(pitchToScale))
      }
      rest = fittedToScale && lastNote && pitchToScale === lastNote.pitch;
      note = !rest;
      note = true;

      var delay = 0;
      if (lastRest) {
        delay += lastRest.duration;
      }
      if (lastNote && lastNote.staccato) {
        delay += lastNote.duration / 2;
      }
    }

    if (rest) {
      if (lastRest) {
        lastRest.duration += beatStep;
      } else {
        lastRest = {
          duration: beatStep
        };
      }
    }

    if (note) {
      lastNote = {
        char: char,
        delay: delay,
        pitchBeforeFit: pitch,
        pitch: pitchToScale,
        fittedToScale: fittedToScale,
        position: beatCount + startBeat,
        duration: beatStep,
        sent: false,
        staccato: staccato,
        velocity: velocity
      };
      lastRest = undefined;
    }

    if (note || rest) {
      beatCount += beatStep;
      plingCount = 0;
      accidental = 0;
      staccato = false;
      velocity = baseVelocity;
      numbers = [];
      natural = false;
    }

    if (isSustain(char)) {
      if (lastRest) {
        lastRest.duration += beatStep;
      } else {
        lastNote.duration += beatStep;
      }
      beatCount += beatStep;
    }

    if (isPling(char)) {
      plingCount += 1;
    }

    if (isSharp(char)) {
      accidental += 1;
    }

    if (isFlat(char)) {
      accidental -= 1;
    }

    if (isNatural(char)) {
      natural = true;
    }

    if (isStaccato(char)) {
      staccato = true;
    }

    if (isAccent(char)) {
      velocity += velocityStep;
    }

    if (!isNaN(char) || char === '-') {
      numbers.push(char);
    }

    if (isComma(char)) {
      if (numbers.length) {
        beatStep = parseInt(numbers.join(''), 10);
        numbers = [];
      }
    }

    if (isColon(char)) {
      if (numbers.length) {
        octave = parseInt(numbers.join(''), 10) + 4;
        numbers = [];
        octaveReset = true;
        accidental = 0;
      }
    }

    if (isTranspose(char)) {
      if (numbers.length) {
        transpose = parseInt(numbers.join(''), 10);
        numbers = [];
      }
    }

    ensureLastNoteSent();

    function ensureLastNoteSent() {
      if (i === s.length - 1) {
        if (lastNote && !lastNote.sent) {
          sendNote(playerId, lastNote);
        }
        return beatCount + startBeat;
      }
    }
  }
}

function sendTempo(playerId, tempo) {
  listeners.forEach(function (cb) {
    cb({
      playerId: playerId,
      tempo: tempo
    });
  });

}

function sendNote(playerId, note) {
  var sendData = {
    playerId: playerId,
    note: {
      pitch: note.pitch,
      duration: note.duration,
      isRest: note.isRest,
      delay: note.delay,
      velocity: note.velocity
    }
  };
  if (note.staccato) {
    sendData.note.duration /= 2;
  }

  listeners.forEach(function (cb) {
    cb(sendData);
  });
  note.sent = true;
}


var listeners = [];
var api = {
  send: send,
  listen: function (cb) {
    listeners.push(cb);
  }
};

module.exports = api;