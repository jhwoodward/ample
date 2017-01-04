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
  sharps = sharps || [];
  flats = flats || [];
  transpose = transpose || 0;

  var pitch = utils.midiPitchFromNote(char + octave);

  if (!natural) {
    var isFlat = accidental === -1 || flats.indexOf(char.toUpperCase()) > -1;
    var isSharp = accidental === 1 || sharps.indexOf(char.toUpperCase()) > -1
    if (isFlat) {
      pitch -= 1;
    }
    if (isSharp) {
      pitch += 1;
    }
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

function isSlur(char) {
  return char === '~';
}

function isStartKeySignature(chars) {
  return chars === 'K(';
}


function isEndKeySignature(chars) {
  return chars === ')K';
}

function isStartKeySwitch(char) {
  return char === '[';
}

function isStartAnnotation(char) {
  return char === '{';
}

function isEndAnnotation(char) {
  return char === '}';
}



function isEndKeySwitch(char) {
  return char === ']';
}

function isStartScaleSignature(chars) {
  return chars === 'S(';
}

function isEndScaleSignature(chars) {
  return chars === ')S';
}

function isSetTempo(chars) {
  return chars === '=T';
}

function isSetDynamics(chars) {
  return chars === '=L';
}

function isSetPitch(chars) {
  return chars === '=P';
}

function getKeyswitch(s, start) {

  var i = start;
  var accidental = 0;
  var octave = 4;
  var numbers = [];
  var note;
  var char;

  while (i < s.length && !isEndKeySwitch(char)) {
    char = s[i];

    if (isSharp(char)) {
      accidental += 1;
    }

    if (isFlat(char)) {
      accidental -= 1;
    }

    if (isColon(char)) {
      if (numbers.length) {
        octave = parseInt(numbers.join(''), 10) + 4;
        numbers = [];
        accidental = 0;
      }
    }

    if (!isNaN(char) || char === '-') {
      numbers.push(char);
    }
    if (isNote(char)) {
      note = char;
    }

    i++;
  }

  return {
    pitch: getPitch(note, octave, accidental),
    length: i - start
  };

}

function getAnnotation(s, start) {

  var i = start;
  var char;
  var annotation = '';

  while (i < s.length && !isEndAnnotation(char)) {
    char = s[i];
    if (!isStartAnnotation(char) && !isEndAnnotation(char)) {
      annotation += char;
    }
    i++;
  }

  return {
    value: annotation.trim(),
    length: i - start
  };

}


function send(playerId, s, conduct, config) {
  var messages = [];
  var conductor = Object.assign({}, conduct);
  var lastNote, lastRest;
  var tickCount = 10;
  var beatStep = 48;
  var octave = 4;
  var transpose = 0;
  var plingCount = 0;
  var numbers = [];
  var char;
  var octaveReset = false;
  var octaveBeforeKeySwitch;
  var accidental = 0; //sharp or flat / +1 / -1
  var natural = false;
  var slur = false;
  var baseVelocity = 80;
  var velocity = baseVelocity;
  var velocityStep = 10;
  var staccato;
  var settingKeySignature = false;
  var settingScaleSignature = false;
  var tempo = 120;
  var flats = [], sharps = [], scale = []; // for key sig

  var annotations = {
    legato: false,
    staccato: false,
    glissando: false
  };

  var i = 0;
  while (i < s.length) {

    var beat = Math.round(tickCount / 48);

    if (conductor[beat]) {

      //   console.log('instruction at ' + beat,conductor[beat])
      //insert global instruction
      //   console.log('before',s);
      s = s.substring(0, i) + ' ' + conductor[beat] + ' ' + s.substring(i, s.length);
      //    console.log('after',s);

      delete conductor[beat];
    }


    if (isIgnore(s[i])) {
      ensureLastNoteSent();
      i++;
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
      i += 2; continue;
    }
    if (isEndKeySignature(char + char2)) {
      settingKeySignature = false;
      i += 2; continue;
    }

    if (isStartKeySwitch(char)) {
      var keyswitch = getKeyswitch(s, i);
      sendKeyswitch(keyswitch.pitch, tickCount);
      i += keyswitch.length; continue;
    }

    if (isStartAnnotation(char)) {
      var annotation = getAnnotation(s, i);

      console.log(annotation);
      switch (annotation.value) {
        case 'legato':
          annotations.legato = true;
          annotations.staccato = false;
          break;
        case 'staccato':
          annotations.staccato = true;
          annotations.legato = false;
          annotations.glissando = false;
        case 'glissando':
          annotations.glissando = true;
          annotations.staccato = false;
        case 'default':
          annotations.legato = false;
          annotations.staccato = false;
          annotations.glissando = false;
          break;
      }
      i += annotation.length; continue;
    }

    if (isStartScaleSignature(char + char2)) {
      settingScaleSignature = true;
      scale = [];
      i += 2; continue;
    }
    if (isEndScaleSignature(char + char2)) {
      settingScaleSignature = false;
      i += 2; continue;
    }

    if (isSetTempo(char + char2)) {
      tempo = parseInt(numbers.join(''), 10);
      sendTempo(playerId, tempo);
      numbers = [];
      i += 2; continue;
    }


    if (isSetPitch(char + char2)) { //pitchbend not transpose
      sendPitch(parseInt(numbers.join(''), 10));
      numbers = [];
      i += 2; continue;
    }

    if (isSetDynamics(char + char2)) { 
      sendCC(1,parseInt(numbers.join(''), 10));//cc1 = modulation
      numbers = [];
      i += 2; continue;
    }

    if (settingKeySignature) {
      //expect 2 characters per accidental, eg -B -A = f major
      if (isFlat(char)) {
        flats.push(char2.toUpperCase());
        i += 2; continue;
      }
      if (isSharp(char)) {
        sharps.push(char2.toUpperCase());
        i += 2; continue;
      }
    }

    if (settingScaleSignature) {
      if (isFlat(char) || isSharp(char)) {
        scale.push(char + char2.toUpperCase());
        i += 2;
      } else {
        scale.push(char.toUpperCase());
        i++;
      }
      continue;
    }

    var rest = isRest(char);// || omit.indexOf(char.toUpperCase()) > -1;
    var note = isNote(char) && !rest;

    if ((note || rest || isRelativePitch(char)) && lastNote && !lastNote.sent) {
      sendNote(lastNote);
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
        pitchBeforeFit: pitch,
        pitch: pitchToScale,
        fittedToScale: fittedToScale,
        position: tickCount,
        duration: beatStep,
        sent: false,
        staccato: staccato,
        legato: annotations.legato,
        lastNoteLegato: lastNote && lastNote.legato,
        slur: slur,
        velocity: velocity
      };
      lastRest = undefined;
    }

    if (note || rest) {
      tickCount += beatStep;
      plingCount = 0;
      accidental = 0;
      staccato = false;
      velocity = baseVelocity;
      numbers = [];
      natural = false;
      slur = false;
    }

    if (isSustain(char)) {
      if (lastRest) {
        lastRest.duration += beatStep;
      } else {
        lastNote.duration += beatStep;
      }
      tickCount += beatStep;
    }

    if (isPling(char)) {
      plingCount += 1;
    }

    if (isSharp(char)) {
      accidental += 1;
    }

    if (isSlur(char)) {
      slur = true;
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
    i += 1;
  }

  function ensureLastNoteSent() {
    if (i === s.length - 1) {
      if (lastNote && !lastNote.sent) {
        sendNote(lastNote);
      }
      return tickCount;
    }
  }


  function sendNote(note) {


    if (annotations.glissando || note.slur) {
      sendPitch(0, note.position - 1);
    } else {


      sendPitch(8191, note.position - 1);


    }


    var on = note.position;
    var duration = note.duration - 5; //default slightly detached

    if (note.legato) {
      
      duration = note.duration + 1; //allow overlap to trigger legato transitions
      if (note.lastNoteLegato) {
        on -= 10; //bring position forward slightly to compensate for legato transition
      }
      
    }
    if (annotations.staccato || note.staccato) {
      duration = note.duration / 2;
    }

    var off = on + duration;

    messages.push({
      type: 'noteon',
      pitch: note.pitch,
      velocity: note.velocity,
      tick: on,
      channel: playerId
    });

    messages.push({
      type: 'noteoff',
      pitch: note.pitch,
      tick: off,
      channel: playerId
    });

    note.sent = true;
  }

  function sendCC(number, value, position) {
    messages.push({
      type: 'cc',
      controller: number,
      value: value,
      tick: position || tickCount,
      channel: playerId
    });
  }

  function sendPitch(value, position) {
    messages.push({
      type: 'pitch',
      value: value,
      tick: position || tickCount,
      channel: playerId
    });
  }

  function sendKeyswitch(pitch, position) {

    messages.push({
      type: 'noteon',
      pitch: pitch,
      velocity: 64,
      tick: position,
      channel: playerId
    });
    messages.push({
      type: 'noteoff',
      pitch: pitch,
      tick: position + 1,
      channel: playerId
    });


  }

  return messages;
}

function sendTempo(tempo) {

  messages.push({
    type: 'tempo',
    value: tempo,
  });

}


var api = {
  send: send
};

module.exports = api;