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
  return char === 'x';
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

function isLegato(char) {
  return char === '_';
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

function isSetVelocity(chars) {
  return chars === '=V';
}

function isSetBaseVelocity(chars) {
  return chars === '=VB';
}

function getKeyswitch(score, start) {

  var cursor = start;
  var accidental = 0;
  var octave = 4;
  var numbers = [];
  var note;
  var char;
  var temp;

  while (cursor < score.length && !isEndKeySwitch(char)) {
    char = score[cursor];

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

    if (isComma(char)) {
      temp = true;
    }

    if (!isNaN(char) || char === '-') {
      numbers.push(char);
    }
    if (isNote(char)) {
      note = char;
    }

    cursor++;
  }

  return {
    pitch: getPitch(note, octave, accidental),
    length: cursor - start,
    temp:temp
  };

}

function getAnnotation(s, start) {

  var cursor = start;
  var char;
  var annotation = '';

  while (cursor < s.length && !isEndAnnotation(char)) {
    char = s[cursor];
    if (!isStartAnnotation(char) && !isEndAnnotation(char)) {
      annotation += char;
    }
    cursor++;
  }

  return {
    value: annotation.trim(),
    length: cursor - start
  };

}

function splice(score, cursor, s) {
   return `${score.substring(0, cursor)}  ${s} ${score.substring(cursor, score.length)}`;
}

function send(player, conductor) {
  var messages = [];
  conductor = Object.assign({},conductor); //copy object to avoid mutations splling out
  var lastNote, lastRest, previousNote;
  var tickCount = 10;
  var beatStep = 48;
  var octave = 4;
  var transpose = 0;
  var plingCount = 0;
  var numbers = [];
  var char, char2,char3;
  var octaveReset = false;
  var octaveBeforeKeySwitch;
  var accidental = 0; //sharp or flat / +1 / -1
  var natural = false;
  var accent = false;
  var pizzicato = false;
  var slur = false;
  var baseVelocity = 80;
  var velocity = baseVelocity;
  var velocityStep = 10;
  var staccato = false;
  var legato = false;
  var settingKeySignature = false;
  var settingScaleSignature = false;
  var tempo = 120;
  var flats = [], sharps = [], scale = []; // for key sig
  var tempKeySwitch, lastPermKeySwitch;

  var annotations = {
    legato: false,
    staccato: false,
    glissando: false
  };

  var cursor = 0;
  while (cursor < player.score.length) {

    var beat = Math.round(tickCount / 48);

    if (conductor[beat]) {
      player.score = splice(player.score, cursor, conductor[beat]);
      delete conductor[beat];
    }

    if (isIgnore(player.score[cursor])) {
      ensureLastNoteSent();
      cursor++;
      continue;
    }

    char = player.score[cursor];

    if (cursor < player.score.length - 1) {
      char2 = player.score[cursor + 1];
    } else {
      char2 = '';
    }
    if (cursor < player.score.length - 2) {
      char3 = player.score[cursor + 2];
    } else {
      char3 = '';
    }
    if (isStartKeySignature(char + char2)) {
      settingKeySignature = true;
      flats = []; sharps = []; omit = [];
      cursor += 2; continue;
    }
    if (isEndKeySignature(char + char2)) {
      settingKeySignature = false;
      cursor += 2; continue;
    }

    if (isStartKeySwitch(char)) {
      var keyswitch = getKeyswitch(player.score, cursor);
      sendKeyswitch(keyswitch.pitch, tickCount);
      cursor += keyswitch.length; 
      if (keyswitch.temp) {
        var revert;
        if (lastPermKeySwitch) {
          revert = lastPermKeySwitch.pitch;
        } else if (annotations.default) {
          var defaultKeyswitch = getKeyswitch(annotations.default,0);
          revert = defaultKeyswitch.pitch || 24;
        } else {
          revert = 24;
        }
        keyswitch.revert = revert;
        tempKeySwitch = keyswitch;
      } else {
        tempKeySwitch = undefined;
        lastPermKeySwitch = keyswitch;
      }
      continue;
    }

    if (isStartAnnotation(char)) {
      var annotation = getAnnotation(player.score, cursor);

      switch (true) {
        case annotation.value.indexOf('legato') === 0:
          annotations.legato = true;
          annotations.staccato = false;
          break;
        case annotation.value.indexOf('staccato') === 0:
          annotations.staccato = true;
          annotations.legato = false;
          annotations.glissando = false;
        case annotation.value.indexOf('pizzicato') === 0:
          annotations.legato = false;
          annotations.glissando = false;
        case annotation.value.indexOf('spiccato') === 0:
          annotations.legato = false;
          annotations.glissando = false;
        case annotation.value.indexOf('glissando') === 0:
          annotations.glissando = true;
          annotations.staccato = false;
        case annotation.value.indexOf('default') === 0:
          annotations.legato = false;
          annotations.staccato = false;
          annotations.glissando = false;
          break;
      }
      cursor += annotation.length; 

      if (player.annotations[annotation.value]) {
        player.score = splice(player.score, cursor, player.annotations[annotation.value]);
      }

      continue;
    }

    if (isStartScaleSignature(char + char2)) {
      settingScaleSignature = true;
      scale = [];
      cursor += 2; continue;
    }
    if (isEndScaleSignature(char + char2)) {
      settingScaleSignature = false;
      cursor += 2; continue;
    }

    if (isSetTempo(char + char2)) {
      tempo = parseInt(numbers.join(''), 10);
      sendTempo(tempo);
      numbers = [];
      cursor += 2; continue;
    }

  if (isSetBaseVelocity(char + char2 + char3)) {
      baseVelocity = parseInt(numbers.join(''), 10);
      numbers = [];
      cursor += 3; continue;
    }
    if (isSetVelocity(char + char2)) {
      velocity = parseInt(numbers.join(''), 10);
      numbers = [];
      cursor += 2; continue;
    }

 

    if (isSetPitch(char + char2)) { //pitchbend not transpose
      sendPitch(parseInt(numbers.join(''), 10));
      numbers = [];
      cursor += 2; continue;
    }

    if (isSetDynamics(char + char2)) {
      sendCC(1, parseInt(numbers.join(''), 10));//cc1 = modulation
      numbers = [];
      cursor += 2; continue;
    }

    if (settingKeySignature) {
      //expect 2 characters per accidental, eg -B -A = f major
      if (isFlat(char)) {
        flats.push(char2.toUpperCase());
        cursor += 2; continue;
      }
      if (isSharp(char)) {
        sharps.push(char2.toUpperCase());
        cursor += 2; continue;
      }
    }

    if (settingScaleSignature) {
      if (isFlat(char) || isSharp(char)) {
        scale.push(char + char2.toUpperCase());
        cursor += 2;
      } else {
        scale.push(char.toUpperCase());
        cursor++;
      }
      continue;
    }

    var rest = isRest(char);// || omit.indexOf(char.toUpperCase()) > -1;
    var note = isNote(char) && !rest;




    if ((note || rest || isRelativePitch(char)) && lastNote && !lastNote.sent) {
      if (legato && !staccato && !accent && !pizzicato) {

/*
        if (player.annotations['_']) {
          var keyswitch = getKeyswitch(player.annotations['_'], 0);
          sendKeyswitch(keyswitch.pitch, tickCount-1);
        } 
        */
        lastNote.legato = true;
      }
      if (staccato) {
        lastNote.staccato = true;
      }
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
      //note = !rest;
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


    if (previousNote && previousNote.legato && !annotations.legato && !lastNote.legato && !previousNote.noteOffSent) {
      sendNoteOff(previousNote,tickCount-previousNote.duration-10);
    }

    if (note) {
      previousNote = lastNote;
      lastNote = {
        char: char,
        pitchBeforeFit: pitch,
        pitch: pitchToScale,
        fittedToScale: fittedToScale,
        position: tickCount,
        duration: beatStep,
        sent: false,
        staccato: annotations.staccato, // single note staccato needs to be applied after the note, before send
        legato: (!staccato && !accent && !pizzicato) && annotations.legato, // single note legato needs to be applied after the note, before send
        lastNoteLegato: lastNote && lastNote.legato,
        slur: slur || annotations.glissando,
        lastNoteSlur: lastNote && lastNote.slur,
        velocity: velocity
      };
      lastRest = undefined;
    }

    if (note || rest) {
      tickCount += beatStep;
      plingCount = 0;
      accidental = 0;
      accent = false;
      pizzicato = false;
      staccato = false;
      velocity = baseVelocity;
      numbers = [];
      natural = false;
      slur = false;
      legato = false;
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


    if (isLegato(char)) {
      legato = true;
   
    }

    if (isStaccato(char)) {
      staccato = true;
    }

    if (isAccent(char)) {
      accent = true;
      if (player.annotations[char]) {
         player.score = splice(player.score, cursor+1, player.annotations[char]);
      } else { //default accent
        velocity += velocityStep;
      }
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
    cursor ++;
  }

  function ensureLastNoteSent() {
    if (cursor === player.score.length - 1) {
      if (lastNote && !lastNote.sent) {
        sendNote(lastNote);
      }
      if (lastRest) {
        messages.push({
          type: 'noteoff',
          pitch: lastNote.pitch,
          tick: tickCount,
          channel: player.channel
        });
      }
      return tickCount;
    }
  }


  function sendNote(note) {

    if (note.slur) {
      if (!note.lastNoteSlur) {
        if (note.lastNoteLegato) {
          sendPitch(0, note.position - 11); //bring position forward slightly to compensate for legato transition
        } else {
          sendPitch(0, note.position - 1);
        }
      }
    } else {
      if (note.lastNoteLegato) {
        sendPitch(8191, note.position - 11); //bring position forward slightly to compensate for legato transition
      } else {
        sendPitch(8191, note.position - 1);
      }
    }

    var on = note.position;
    var duration = note.duration - 5; //default slightly detached

  
    if (note.legato) {
      duration = note.duration + 1; //allow overlap to trigger legato transitions
    }//TODO: SHOULD ONLY BE DONE IF NEXT NOTE IS ALSO LEGATO?
    
    if (note.staccato) {
      duration = note.duration / 2;
    }

    if (note.lastNoteLegato &&note.legato) {
      on -= 10; //bring position forward slightly to compensate for legato transition
      duration+=10
    }

    var off = on + duration;

    messages.push({
      type: 'noteon',
      pitch: note.pitch,
      velocity: note.velocity,
      tick: on,
      channel: player.channel
    });

    messages.push({
      type: 'noteoff',
      pitch: note.pitch,
      tick: off,
      channel: player.channel
    });
    

    note.sent = true;


    if (tempKeySwitch) {
      sendKeyswitch(tempKeySwitch.revert,tickCount+1);
      tempKeySwitch = undefined;
    }
  }

  function sendNoteOff(note,position) {
    messages.push({
      type: 'noteoff',
      pitch: note.pitch,
      tick: position,
      channel: player.channel
    });
    note.noteOffSent=true;
  }

  function sendCC(number, value, position) {
    messages.push({
      type: 'cc',
      controller: number,
      value: value,
      tick: position || tickCount,
      channel: player.channel
    });
  }

  function sendPitch(value, position) {
    messages.push({
      type: 'pitch',
      value: value,
      tick: position || tickCount,
      channel: player.channel
    });
  }

  function sendKeyswitch(pitch, position) {

    messages.push({
      type: 'noteon',
      pitch: pitch,
      velocity: 64,
      tick: position,
      channel: player.channel
    });
    messages.push({
      type: 'noteoff',
      pitch: pitch,
      tick: position + 1,
      channel: player.channel
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