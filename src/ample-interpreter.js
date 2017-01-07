var utils = require('jsmidgen').Util;
var _ = require('lodash');

function isNote(char) {
  var notes = 'abcdefgABCDEFGxX';
  return notes.indexOf(char) > -1;
}


function isRelativePitch(char) {
  return 'xX'.indexOf(char) > -1;
}


function isRest(char) {
  return char === '^';
}

function isSustain(char) {
  return char === '/';
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
function isSharp(char) {
  return char === '+';
}
function isFlat(char) {
  return char === '-';
}
function isNatural(char) {
  return char === '=';
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

function isGlissando(char) {
  return char === '~';
}

function isLegato(char) {
  return char === '_';
}

function isEndKeySwitch(char) {
  return char === ']';
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

  var noteSuffix = accidental < 0 ? 'b': accidental > 0 ? '#' : '';

  return {
    pitch: getPitch(note, octave, accidental),
    char: note + noteSuffix,
    length: cursor - start,
    temp: temp
  };

}

function splice(score, cursor, s) {
  return `${score.substring(0, cursor)}  ${s} ${score.substring(cursor, score.length)}`;
}

function parseChars(score, parser) {
  parser.char = score[parser.cursor];

  if (parser.cursor < score.length - 1) {
    parser.char2 = score[parser.cursor + 1];
  } else {
    parser.char2 = '';
  }
  if (parser.cursor < score.length - 2) {
    parser.char3 = score[parser.cursor + 2];
  } else {
    parser.char3 = '';
  }

  parser.char2 = parser.char + parser.char2;
  parser.char3 = parser.char2 + parser.char3;

  return parser;
}

function spliceConductorInstructions(conductor, player, state) {
  var beat = Math.round(state.time.tick / 48);
  if (conductor[beat] && !conductor[beat].sent) {
    player.score = splice(player.score, state.parser.cursor, conductor[beat]);
    conductor[beat].sent = true;
  }
}

function ignore(score, parser) {

  if (isIgnore(score[parser.cursor])) {
    // ensureLastNoteSent();//no longer in scope
    parser.cursor++;
    return true;
  }
  return false;

  function isIgnore(char) {
    return char === ' ';
  }
}

function isKeyScale(parser, key) {

  if (isStartKey(parser.char2)) {
    parser.settingKey = true;
    key.flats = []; key.sharps = [];
    parser.cursor += 2;
    return true;
  }
  if (isEndKey(parser.char2)) {
    parser.settingKey = false;
    parser.cursor += 2;
    return true;
  }

  if (isStartScale(parser.char2)) {
    parser.settingScale = true;
    key.scale = [];
    parser.cursor += 2;
    return true;
  }
  if (isEndScale(parser.char2)) {
    parser.settingScale = false;
    parser.cursor += 2;
    return true;
  }

  if (parser.settingKey) {
    //expect 2 characters per accidental, eg -B -A = f major
    if (isFlat(parser.char)) {
      key.flats.push(parser.char2[1].toUpperCase());
      parser.cursor += 2;
    } else if (isSharp(parser.char)) {
      key.sharps.push(parser.char2[1].toUpperCase());
      parser.cursor += 2;
    } else {
      console.error('Key signature must contain sharps & flats only (+/-)');
    }
    return true;
  }

  if (parser.settingScale) {
    if (isFlat(char) || isSharp(char)) {
      key.scale.push(parser.char2.toUpperCase());
      parser.cursor += 2;
    } else {
      key.scale.push(parser.char.toUpperCase());
      parser.cursor++;
    }
    return true;
  }

  return false;

  function isStartKey(chars) {
    return chars === 'K(';
  }
  function isEndKey(chars) {
    return chars === ')K';
  }

  function isStartScale(chars) {
    return chars === 'S(';
  }

  function isEndScale(chars) {
    return chars === ')S';
  }
}


function isKeyswitch(score, parser, time, keyswitch) {
  if (isStartKeySwitch(parser.char)) {

    var ks = getKeyswitch(score, parser.cursor);
    
    if (keyswitch.current && !keyswitch.current.temp) {
      keyswitch.previous = _.merge({},keyswitch.current);
    }
    keyswitch.current = ks;
    
    parser.cursor += ks.length;
    if (ks.temp) {
      var revert;
      if (keyswitch.previous) {
        revert = keyswitch.previous.pitch;
      } else if (keyswitch.default) {
        revert = keyswitch.default.pitch;
      } else {
        revert = 24;
      }
      ks.revert = revert;
    }
    return true;
  }

  return false;

  function isStartKeySwitch(char) {
    return char === '[';
  }

}

function isAnnotation(player, parser, phrase) {
  if (matchStart(parser.char)) {
    var annotation = getAnnotation(player.score, parser.cursor);

    switch (true) {
      case annotation.value.indexOf('legato') === 0:
        phrase.legato = true;
        phrase.staccato = false;
        break;
      case annotation.value.indexOf('staccato') === 0:
        phrase.staccato = true;
        phrase.legato = false;
        phrase.glissando = false;
        break;
      case annotation.value.indexOf('pizzicato') === 0:
        phrase.legato = false;
        phrase.glissando = false;
        break;
      case annotation.value.indexOf('spiccato') === 0:
        phrase.legato = false;
        phrase.glissando = false;
        break;
      case annotation.value.indexOf('glissando') === 0:
        phrase.glissando = true;
        phrase.staccato = false;
        break;
      case annotation.value.indexOf('default') === 0:
        phrase.legato = false;
        phrase.staccato = false;
        phrase.glissando = false;
        break;
    }
    parser.cursor += annotation.length;

      if (player.annotations[annotation.value]) {
        player.score = splice(player.score, parser.cursor, player.annotations[annotation.value]);
      }

    return true;
  }

  return false;

  function getAnnotation(s, start) {
    var cursor = start;
    var char;
    var annotation = '';
    while (cursor < s.length && !matchEnd(char)) {
      char = s[cursor];
      if (!matchStart(char) && !matchEnd(char)) {
        annotation += char;
      }
      cursor++;
    }
    return {
      value: annotation.trim(),
      length: cursor - start
    };
  }
  function matchEnd(char) {
    return char === '}';
  }
  function matchStart(char) {
    return char === '{';
  }

}

function isTempo(parser, time) {
  if (!match(parser.char2)) return false;

  time.tempo = parseInt(parser.numbers.join(''), 10);
  sendTempo(tempo);
  parser.numbers = [];
  parser.cursor += 2;
  return true;

  function match(chars) {
    return chars === '=T';
  }
}

function isVelocity(parser, velocity) {
  if (matchBase(parser.char3)) {
    velocity.base = parseInt(parser.numbers.join(''), 10);
    parser.numbers = [];
    parser.cursor += 3;
    return true;
  }
  if (match(parser.char2)) {
    velocity.value = parseInt(parser.numbers.join(''), 10);
    parser.numbers = [];
    parser.cursor += 2;
    return true;
  }
  return false;

  function match(chars) {
    return chars === '=V';
  }

  function matchBase(chars) {
    return chars === '=VB';
  }
}

function isPitchbend(parser, expression) {
  if (!match(parser.char2)) return false;

  // sendPitch(parseInt(parser.numbers.join(''), 10));//attach note note instead ?

  expression.pitchbend = parseInt(parser.numbers.join(''), 10);

  parser.numbers = [];
  parser.cursor += 2;
  return true;

  function match(chars) {
    return chars === '=P';
  }

}

function isDynamics(parser, expression) {
  if (!match(parser.char2)) return false;

  // sendCC(1, parseInt(parser.numbers.join(''), 10));//cc1 = modulation - attache note note instead ?
  expression.dynamics = parseInt(parser.numbers.join(''), 10);
  parser.numbers = [];
  parser.cursor += 2;
  return true;

  function match(chars) {
    return chars === '=L';
  }
}

function setOctave(parser, pitch, key) {

 //console.log('prev: ' + pitch.char, 'current: ' + parser.char);
  if (pitch.char && !parser.octaveReset) {
   
    var nextPitch = getPitch(parser.char, pitch.octave, pitch.accidental, pitch.natural, key.sharps, key.flats, pitch.transpose);

    var wouldBeSameOrHigher = nextPitch >= pitch.raw;
    var wouldBeSameOrLower = nextPitch <= pitch.raw;
    var wouldBeHigher = nextPitch > pitch.raw;
    var wouldBeLower = nextPitch < pitch.raw;

    var shouldGoHigher = isUpperCase(parser.char);
    var shouldGoLower = isLowerCase(parser.char);

    if (shouldGoLower) { 
      if (parser.octaveJump) {
        if (wouldSameBeHigher) {
          pitch.octave -= parser.octaveJump;
        }
      } else {
        var octaveUp = pitch.char === parser.char.toUpperCase();
        var isSharp = pitch.accidental >= 0;
        if (wouldBeHigher || (octaveUp && isSharp)) {
          pitch.octave -= 1;
        }
      }
    }
    if (shouldGoHigher) { 
      if (parser.octaveJump) {
        if (wouldBeSameOrLower) {
          pitch.octave += parser.octaveJump;
        }
      } else {
        var octaveDown = pitch.char === parser.char.toLowerCase();
        var isFlat = pitch.accidental <= 0;
        if (wouldBeLower || octaveDown && isFlat) {
          pitch.octave += 1;
        }
      }
    }

  }
  if (parser.octaveReset) {
    if (isLowerCase(parser.char)) {
      pitch.octave -= 1;
    }
    parser.octaveReset = false;
  }

}

function fitToScale(parser, pitch, key) {

  pitch.value = fit(pitch.raw, key.scale);
  /*
  note.fittedToScale = note.pitchBeforeFit !== note.pitch;
  if (note.fittedToScale) {
    console.log(utils.noteFromMidiPitch(note.pitchBeforeFit) + '->' + utils.noteFromMidiPitch(note.pitch))
  }
  note.fittedRepeat = note.fittedToScale && lastNote && note.pitch === lastNote.pitch;
*/


  function fit(pitch, scale) {

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
}

function setPitch(parser, pitch, key) {
  pitch.char = parser.char
  if (isRelativePitch(parser.char)) {
    pitch.raw = pitch.raw + pitch.accidental
  } else {
    pitch.raw = getPitch(parser.char, pitch.octave, pitch.accidental, pitch.natural, key.sharps, key.flats, pitch.transpose);
  }
}

function isAccidental(parser, pitch) {
  if (isSharp(parser.char)) {
    pitch.accidental++;
    parser.cursor++;
    return true;
  }

  if (isFlat(parser.char)) {
    pitch.accidental--;
    parser.cursor++;
    return true;
  }

  if (isNatural(parser.char)) {
    pitch.natural = true;
    parser.cursor++;
    return true;
  }


}

function isNumeric(parser) {
  if (!isNaN(parser.char) || parser.char === '-') {
    parser.numbers.push(parser.char);
    parser.cursor++;
    return true;
  }

}


function isTranspose(parser, pitch) {
  if (match(parser.char)) {
    if (parser.numbers.length) {
      pitch.transpose = parseInt(parser.numbers.join(''), 10);
      parser.numbers = [];
    }
    parser.cursor++;
    return true;
  }
  function match(char) {
    return char === '@';
  }
}

function isBeatstep(parser, time) {
  if (isComma(parser.char)) {
    if (parser.numbers.length) {
      time.step = parseInt(parser.numbers.join(''), 10);
      parser.numbers = [];
    }
    parser.cursor++;
    return true;
  }
}

function isArticulation(parser, player, expression) {

  if (isGlissando(parser.char)) {
    expression.note.glissando = true;
    parser.cursor++;
    return true;
  }
  if (isLegato(parser.char)) {
    expression.note.legato = true;
       if (player.annotations.legato) {
        player.score = splice(player.score, parser.cursor + 1, player.annotations.legato);
       } 
    parser.cursor++;
    return true;
  }

  if (isStaccato(parser.char)) {
    expression.note.staccato = true;
    parser.cursor++;
    return true;
  }

  if (isAccent(parser.char)) {
    expression.note.accent = true;
     if (player.annotations.accent) {
      player.score = splice(player.score, parser.cursor + 1, player.annotations.accent);
    } else { //default accent
    expression.velocity.value += expression.velocity.step;
      }
    parser.cursor++;
    return true;
  }
}

function isOctave(parser, pitch) {

  if (isPling(parser.char)) {
    parser.octaveJump++;
    parser.cursor++;
    return true;
  }

  if (isColon(parser.char)) {
    if (parser.numbers.length) {
      pitch.octave = parseInt(parser.numbers.join(''), 10) + 4;
      parser.numbers = [];
      parser.octaveReset = true;
      pitch.accidental = 0;
    }
    parser.cursor++;
    return true;
  }
}

function send(player, conductor) {
  
  var messages = [];
  conductor = _.merge({}, conductor); //copy object to avoid mutations splling out

  var state = {
    parser: {
      cursor: 0,
      numbers: [],
      char1: '',
      char2: '',
      char3: '',
      settingKey: false,
      settingScale: false,
      octaveReset: false,
      octaveBeforeKeySwitch: 0,
      octaveJump: 0
    },
    key: {
      flats: [],
      sharps: [],
      scale: []
    },
    expression: {
      dynamics: 0,
      pitchbend: 0,
      velocity: {
        value: 80,
        base: 80,
        step: 10
      },
      keyswitch: {
        previous: undefined,
        current: undefined,
        default: player.annotations && player.annotations.default ? getKeyswitch(player.annotations.default, 0) : undefined
      },
      note: {
        legato: false,
        staccato: false,
        glissando: false,//=slur
        pizzicato: false,
        accent: false
      },
      phrase: {
        legato: false,
        staccato: false,
        glissando: false,
        pizzicato: false
      }
    },
    pitch: {
      char: '', 
      raw: 0, 
      value: 0,
      octave: 4,
      transpose: 0,
      accidental: 0,
      natural: false
    },
    time: {
      beat: 0,
      tempo: 120,
      tick: 10,
      step: 48
    }
  }

  var parsed = [];

  var log = [];

  while (state.parser.cursor < player.score.length) {

    spliceConductorInstructions(conductor, player, state);
    if (ignore(player.score, state.parser)) continue;

    parseChars(player.score, state.parser);

    if (isKeyScale(state.parser, state.key)) continue;
    if (isKeyswitch(player.score, state.parser, state.time, state.expression.keyswitch)) continue;
    if (isAnnotation(player, state.parser, state.expression.phrase)) continue;
    if (isTempo(state.parser, state.time)) continue;
    if (isVelocity(state.parser, state.expression.velocity)) continue;
    if (isPitchbend(state.parser, state.expression)) continue;
    if (isDynamics(state.parser, state.expression)) continue;
    if (isAccidental(state.parser, state.pitch)) continue;
    if (isNumeric(state.parser)) continue;
    if (isTranspose(state.parser)) continue;
    if (isBeatstep(state.parser, state.time)) continue;
    if (isArticulation(state.parser, player, state.expression)) continue;
    if (isOctave(state.parser, state.pitch)) continue;



    if (isRest(state.parser.char)) {
      parsed.push({
        noteoff: true,
        time: _.merge({}, state.time)
      });
    }

    if (isNote(state.parser.char)) {

      //order is important
      setOctave(state.parser, state.pitch, state.key);
      setPitch(state.parser, state.pitch, state.key);
      fitToScale(state.parser, state.pitch, state.key);

      var event = {
        noteon: true,
        time: _.merge({}, state.time),
        pitch: _.merge({}, state.pitch),
        expression: _.merge({}, state.expression)
      }

      parsed.push(event);
    }

    if (isSustain(state.parser.char) ||
      isNote(state.parser.char) ||
      isRest(state.parser.char)) {

      state.time.tick += state.time.step;

      state.parser.octaveJump = 0;
      state.parser.numbers = [];
      state.pitch.accidental = 0;
      state.pitch.natural = false
      state.expression.note.accent = false;
      state.expression.note.pizzicato = false;
      state.expression.note.staccato = false;
      state.expression.velocity.value = state.expression.velocity.base;
      state.expression.note.glissando = false;
      state.expression.note.legato = false;
    }

    state.parser.cursor++;
  }

  console.log(log.join(''));

  var lastKeySwitch;
  var legatoTransition = 7;

  parsed.forEach(function (event, i) {

    var next = i < parsed.length ? parsed[i + 1] : undefined;
    var prev = i > 0 ? parsed[i - 1] : undefined;


    if (event.noteon) {

      var on = event.time.tick;
      var legato = event.expression.note.legato || (prev && prev.expression.phrase.legato && event.expression.phrase.legato );
      var staccato = event.expression.note.staccato || event.expression.phrase.staccato;
      var prevDynamics = prev && prev.noteon ? prev.expression.dynamics: undefined;
      var prevGlissando = prev && prev.noteon ? prev.expression.note.glissando: undefined;
      var prevPitchbend = prev && prev.noteon ? prev.expression.pitchbend: undefined;

      if (legato) {
        on -= legatoTransition; // move note on back to compensate for legato transition
      }

      if (event.expression.keyswitch.current && 
        lastKeySwitch !== event.expression.keyswitch.current.pitch ) {
        var kson = event.time.tick-1;
        if (legato) {
          kson -=legatoTransition;
        }
         sendKeyswitch(
            event.expression.keyswitch.current.pitch,
            event.expression.keyswitch.current.char,
            kson);
         lastKeySwitch = event.expression.keyswitch.current.pitch;
      }

      if (lastKeySwitch && lastKeySwitch.temp) {
        sendKeyswitch(lastKeySwitch.revert,  event.time.tick-1);
        lastKeySwitch = undefined;
      }

      if (event.expression.dynamics && event.expression.dynamics !== prevDynamics) {
        sendCC(1, event.expression.dynamics, event.time.tick - 1, 'dynamics'); //INSTRUMENT SPECIFIC
      }

      if (event.expression.pitchbend && event.expression.pitchbend !== prevPitchbend) {
        sendPitchbend(event.expression.pitchbend, event.time.tick - 1); //INSTRUMENT SPECIFIC
      }


      if (event.expression.note.glissando && !prevGlissando) {
        sendPitchbend(0, on - 1, 'glissando'); //INSTRUMENT SPECIFIC
      } else if (prevGlissando) {
        sendPitchbend(8192, on - 1,' glissando off'); 
      }

      var info = [];

      if (legato) {
        info.push('legato');
      }
      if (staccato) {
        info.push('staccato');
      }
      if (event.expression.note.pizzicato) {
        info.push('pizzicato');
      }
      if (event.expression.note.spiccato) {
        info.push('spiccato');
      }
      if (event.expression.note.accent) {
        info.push('accent');
      }
      if (event.expression.note.glissando) {
        info.push('glissando');
      }
      info = info.length > 1 ? info.join(', '): info;

     
      if (prev && prev.noteon) {

        var off;

        if (legato) {
          off = event.time.tick + 5; // legato slight overlap
        } else {
          off = event.time.tick - 5; // default slightly detached
          /*
          var prevLegato = prev.expression.note.legato || prev.expression.phrase.legato;
          if (prevLegato) {
             off = event.time.tick - 5;// - legatoTransition; //default slightly detached
          } else {
             off = event.time.tick - 5; //default slightly detached
          }     
          */
        }

        sendNoteOff(
          off,
          prev.pitch.value,
          prev.pitch.char)
      }

      sendNoteOn(
        on,
        event.pitch.value,
        event.expression.velocity.value, 
        event.pitch.char,
        info);
    }

    if (event.noteoff) {
      sendNoteOff(
        event.time.tick,
        prev.pitch.value,
        prev.pitch.char);
    }

  });

  function sendNoteOn(tick, pitch, velocity, char, info) {
    messages.push({
      type: 'noteon',
      pitch: pitch,
      velocity: velocity,
      tick: tick,
      channel: player.channel,
      char: char,
      info: info
    });
  }

  function sendNoteOff(tick, pitch, char, info) {
    messages.push({
      type: 'noteoff',
      pitch: pitch,
      tick: tick,
      channel: player.channel,
      char: char,
      info: info
    });
  }

  function sendCC(number, value, position, info) {
    messages.push({
      type: 'cc',
      controller: number,
      value: value,
      tick: position || tickCount,
      channel: player.channel,
      info: info
    });
  }

  function sendPitchbend(value, position, info) {
    messages.push({
      type: 'pitch',
      value: value,
      tick: position || tickCount,
      channel: player.channel,
      info: info
    });
  }

  function sendKeyswitch(pitch, char, position, info) {

    messages.push({
      type: 'noteon',
      pitch: pitch,
      velocity: 64,
      tick: position,
      channel: player.channel,
      info: info,
      char,
      keyswitch: true
    });
    messages.push({
      type: 'noteoff',
      pitch: pitch,
      tick: position + 1,
      channel: player.channel,
      info: info,
      char,
      keyswitch: true
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