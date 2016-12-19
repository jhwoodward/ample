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

function getPitch(char, octave, accidental) {
  //console.log(char + octave);
  return parser.parse(char + octave).midi + accidental;
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
  var baseVelocity = 80;
  var velocity = baseVelocity;
  var velocityStep = 10;
  var staccato;

  for (var i = 0; i < s.length; i++) {

    if (isIgnore(s[i])) { 
      ensureLastNoteSent();
      continue; 
    }

    char = s[i];

    if ((isNote(char) || isRest(char)) && lastNote && !lastNote.sent) {
      sendNote(trackId, lastNote);
    }

    if (isRest(char)) {
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
              if (getPitch(char, octave, accidental) >= lastNote.pitch) {
                octave -= plingCount;
              }
            } else {
              if (getPitch(char, octave, accidental) > lastNote.pitch ||
                lastNote.char === char.toUpperCase() && accidental >= 0) {
                octave -= 1;
              }
            }
          }
          if (isUpperCase(char)) {
            //up
            if (plingCount) {
              if (getPitch(char, octave, accidental) <= lastNote.pitch) {
                octave += plingCount;
              }
            } else {
              if (getPitch(char, octave, accidental) < lastNote.pitch ||
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

      lastNote = {
        char: char,
        delay: delay,
        pitch: getPitch(char, octave, accidental),
        position: beatCount + startBeat,
        duration: beatStep,
        sent: false,
        staccato: staccato,
        velocity: velocity
      };
      lastRest = undefined;
    }

    if (isNote(char) || isRest(char)) {
      beatCount += beatStep;
      plingCount = 0;
      accidental = 0;
      staccato = false;
      velocity = baseVelocity;
      numbers = [];
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