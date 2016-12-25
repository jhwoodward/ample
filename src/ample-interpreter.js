var parser = require('note-parser');

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

function getPitch(char, octave, accidental, natural, sharps, flats, scale) {

  var pitch = parser.parse(char + octave).midi;
  var isFlat = accidental === -1 || flats.indexOf(char.toUpperCase()) > -1;
  var isSharp = accidental === 1 || sharps.indexOf(char.toUpperCase()) > -1
  if (isFlat) {
    pitch -= 1;
  }
  if (isSharp) {
    pitch += 1;
  }

  if (scale.length) {
    var scalePitches = []
    console.log('scale',scale);
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
        scalePitches.push(parser.parse(noteWithoutAccidental + oct).midi + acc);
      }
    });
    scalePitches.sort(function (a, b) {
      return a < b ? -1 : 1;
    });
    var coerced;
    scalePitches.forEach(function (p, i) {
      if (p > pitch && !coerced) {
        coerced = scalePitches[i - 1];
      }
    });

    console.log('pitch', pitch);
    console.log('coerced', coerced);
    return coerced;
    //move note to nearest available note in scalev
  }

  if (natural) {
    return parser.parse(char + octave).midi;
  }

  return pitch;
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

function isNatural(char) {
  return char === '=';
}


function isCoerce(char) {
  return char === 'x';
}

function isStartKeySignature(chars) {
  return chars === 'K(';
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

function send(trackId, s, startBeat) {

  var lastNote, lastRest;
  startBeat = startBeat || 1;
  var beatCount = 0;
  var beatStep = 1;
  var octave = 1;
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
    console.log(rest);

    var note = isNote(char) && !rest;

    if ((note || rest) && lastNote && !lastNote.sent) {
      sendNote(trackId, lastNote);
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

    if (isNote(char)) {
      if (lastNote) {
        if (!octaveReset) {
          if (isLowerCase(char)) {
            //down
            if (plingCount) {
              if (getPitch(char, octave, accidental, natural, sharps, flats, scale) >= lastNote.pitch) {
                octave -= plingCount;
              }
            } else {
              if (getPitch(char, octave, accidental, natural, sharps, flats, scale) > lastNote.pitch ||
                lastNote.char === char.toUpperCase() && accidental >= 0) {
                octave -= 1;
              }
            }
          }
          if (isUpperCase(char)) {
            //up
            if (plingCount) {
              if (getPitch(char, octave, accidental, natural, sharps, flats, scale) <= lastNote.pitch) {
                octave += plingCount;
              }
            } else {
              if (getPitch(char, octave, accidental, natural, sharps, flats, scale) < lastNote.pitch ||
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
      var delay = 0;
      if (lastRest) {
        delay += lastRest.duration;
      }
      if (lastNote && lastNote.staccato) {
        delay += lastNote.duration / 2;
      }
    }

    if (note) {
      lastNote = {
        char: char,
        delay: delay,
        pitch: getPitch(char, octave, accidental, natural, sharps, flats, scale),
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




    ensureLastNoteSent();

    function ensureLastNoteSent() {
      if (i === s.length - 1) {
        if (!lastNote.sent) {
          sendNote(trackId, lastNote);
        }
        return beatCount + startBeat;
      }
    }
  }
}

function sendNote(trackId, note) {
  var sendData = {
    pitch: note.pitch,
    duration: note.duration,
    isRest: note.isRest,
    delay: note.delay,
    velocity: note.velocity
  };
  if (note.staccato) {
    sendData.duration /= 2;
  }

  listeners.forEach(function (cb) {
    cb(trackId,
      sendData);
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