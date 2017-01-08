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

  var noteSuffix = accidental < 0 ? 'b' : accidental > 0 ? '#' : '';

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

function spliceConductorInstructions(conductor, score, state) {
  var beat = Math.round(state.time.tick / 48);
  if (conductor[beat] && !conductor[beat].sent) {
    score = splice(player.score, state.parser.cursor, conductor[beat]);
    conductor[beat].sent = true;
  }
  return score;
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


function isKeyswitch(score, parser, time, expression) {
  if (isStartKeySwitch(parser.char)) {
    var ks = getKeyswitch(score, parser.cursor);
    expression.keyswitch = ks;
    parser.cursor += ks.length;
    return true;
  }

  return false;

  function isStartKeySwitch(char) {
    return char === '[';
  }

}

function isAnnotation(score, parser, phrase) {
  if (matchStart(parser.char)) {
    var annotation = getAnnotation(score, parser.cursor);

    switch (true) {
      case annotation.value.indexOf('legato') === 0:
        phrase.legato = true;
        phrase.staccato = false;
        phrase.default = false;
        phrase.pizzicato = false;
        phrase.spiccato = false;
        break;
      case annotation.value.indexOf('staccato') === 0:
        phrase.staccato = true;
        phrase.legato = false;
        phrase.glissando = false;
        phrase.pizzicato = false;
        phrase.default = false;
        phrase.spiccato = false;
        break;
      case annotation.value.indexOf('pizzicato') === 0:
        phrase.legato = false;
        phrase.pizzicato = true;
        phrase.glissando = false;
        phrase.default = false;
        phrase.spiccato = false;
        break;
      case annotation.value.indexOf('spiccato') === 0:
        phrase.legato = false;
        phrase.glissando = false;
        phrase.default = false;
        phrase.pizzicato = false;
        phrase.spiccato = true;
        break;
      case annotation.value.indexOf('glissando') === 0:
        phrase.glissando = true;
        phrase.staccato = false;
        phrase.default = false;
        phrase.pizzicato = false;
        phrase.spiccato = false;
        break;
      case annotation.value.indexOf('default') === 0:
        phrase.default = true;
        break;
    }
    parser.cursor += annotation.length;

    phrase.annotations = [];
    for (var key in phrase) {
      if (key !== 'annotations' && phrase[key]) {
        phrase.annotations.push(key);
      }
    }

    /*
        if (player.annotations[annotation.value]) {
          player.score = splice(player.score, parser.cursor, player.annotations[annotation.value]);
        }
    */
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

function isVelocity(parser, expression) {
  if (matchBase(parser.char3)) {
    expression.velocityBase = parseInt(parser.numbers.join(''), 10);
    parser.numbers = [];
    parser.cursor += 3;
    return true;
  }
  if (match(parser.char2)) {
    expression.velocity = parseInt(parser.numbers.join(''), 10);
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

function isController(parser, expression) {
  if (!match(parser.char2)) return false;

  var number = parseInt(parser.char3[2], 10);//will need to extend to allow for >9
  var value = parseInt(parser.numbers.join(''), 10);

  expression.controller[number] = value;
  parser.numbers = [];
  parser.cursor += 3;
  return true;

  function match(chars) {
    return chars === '=C';
  }
}

function isDynamics(parser, expression) {
  if (!match(parser.char2)) return false;

  expression.dynamics = parseInt(parser.numbers.join(''), 10);
  parser.numbers = [];
  parser.cursor += 2;
  return true;

  function match(chars) {
    return chars === '=L';
  }
}

function setOctave(parser, pitch, key) {
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

function isArticulation(parser, expression) {

  var found = false;
  if (isGlissando(parser.char)) {
    expression.note.glissando = true;
    found = true;
  }

  if (isLegato(parser.char)) {
    expression.note.legato = true;
    found = true;
    /*
    if (player.annotations.legato) {
      player.score = splice(player.score, parser.cursor + 1, player.annotations.legato);
    }
    */
  }

  if (isStaccato(parser.char)) {
    expression.note.staccato = true;
    found = true;
  }

  if (isAccent(parser.char)) {
    expression.note.accent = true;
    found = true;
    /*
    if (player.annotations.accent) {
      player.score = splice(player.score, parser.cursor + 1, player.annotations.accent);
    }
   
     else { //default accent
      expression.velocity.value += expression.velocity.step;
    }
     */

  }

  expression.note.articulations = [];
  for (var key in expression.note) {
    if (key !== 'articulations' && expression.note[key]) {
      expression.note.articulations.push(key);
    }
  }

  if (found) {
    parser.cursor++;
    return true;
  } else {
    return false;
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

function parse(score, conductor, defaults) {
  conductor = conductor || {};
  var messages = [];
  var parsed = [];
  var log = [];

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
      dynamics: defaults.dynamics,
      controller: {},
      pitchbend: defaults.pitchbend,
      velocity: defaults.velocityBase,
      velocityBase: defaults.velocityBase,
      velocityStep: defaults.velocityStep,
      keyswitch: undefined,
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

  while (state.parser.cursor < score.length) {

    score = spliceConductorInstructions(conductor, score, state);
    if (ignore(score, state.parser)) continue;

    parseChars(score, state.parser);

    if (isKeyScale(state.parser, state.key)) continue;
    if (isKeyswitch(score, state.parser, state.time, state.expression)) continue;
    if (isAnnotation(score, state.parser, state.expression.phrase)) continue;
    if (isTempo(state.parser, state.time)) continue;
    if (isVelocity(state.parser, state.expression)) continue;
    if (isPitchbend(state.parser, state.expression)) continue;
    if (isDynamics(state.parser, state.expression)) continue;
    if (isController(state.parser, state.expression)) continue;
    if (isAccidental(state.parser, state.pitch)) continue;
    if (isNumeric(state.parser)) continue;
    if (isTranspose(state.parser)) continue;
    if (isBeatstep(state.parser, state.time)) continue;
    if (isArticulation(state.parser, state.expression)) continue;
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

      //reset accidentals
      state.pitch.accidental = 0;
      state.pitch.natural = false

      //reset note articulations
      state.expression.note.accent = false;
      state.expression.note.pizzicato = false;
      state.expression.note.staccato = false;
      state.expression.note.glissando = false;
      state.expression.note.legato = false;
      state.expression.note.articulations = [];

      //reset velocity
      state.expression.velocity = state.expression.velocityBase;

      //reset keyswitch
      if (state.expression.keyswitch) {
        state.expression.lastKeyswitch = state.expression.keyswitch;
      }
      state.expression.keyswitch = undefined;
    }

    state.parser.cursor++;
  }

  //final state
  parsed.push({
    finished: true,
    time: _.merge({}, state.time),
    pitch: _.merge({}, state.pitch),
    expression: _.merge({}, state.expression)
  });

  return parsed;

}

function generateMessages(player, parsed) {

  var lastKeySwitch;
  var messages = [];
  var defaults = player.config.defaults;
  var phrase = _.merge({}, defaults);

  var expressions = {
    phrase: ['legato', 'spiccato', 'staccato', 'pizzicato', 'default'],
    preNote: ['glissando', 'spiccato', 'pizzicato', 'accent'],
    postNote: ['staccato', 'legato']
  }

  sendPitchbend(0, phrase.pitchbend, 'default');
  if (phrase.keyswitch) {
    sendKeyswitch(0, phrase.keyswitch.pitch, phrase.keyswitch.char, 'default');
  }
  sendCC(0, 1, phrase.dynamics, 'default'); //INSTRUMENT SPECIFIC
  for (var key in phrase.controller) {
    sendCC(0, parseInt(key, 10), phrase.controller[key], 'default');
  }


  parsed.forEach(function (event, i) {
    var next = i < parsed.length ? parsed[i + 1] : undefined;
    var prev = i > 0 ? parsed[i - 1] : undefined;

    /*
    note.fittedToScale = note.pitchBeforeFit !== note.pitch;
    if (note.fittedToScale) {
      console.log(utils.noteFromMidiPitch(note.pitchBeforeFit) + '->' + utils.noteFromMidiPitch(note.pitch))
    }
    note.fittedRepeat = note.fittedToScale && lastNote && note.pitch === lastNote.pitch;
  */

    if (event.noteon) {

      event.on = event.time.tick;
      event.legato = event.expression.note.legato || (prev && prev.noteon && prev.expression.phrase.legato && event.expression.phrase.legato);
      
      if (event.legato) {
        event.on -= defaults.legatoTransition; // move note on back to compensate for legato transition
      }
      
      event.staccato = event.expression.note.staccato || (prev && prev.noteon && prev.expression.phrase.staccato && event.expression.phrase.staccato);
      var prevDynamics = prev && prev.noteon ? prev.expression.dynamics : defaults.dynamics;
      var prevPitchbend = prev && prev.noteon ? prev.expression.pitchbend : defaults.pitchbend;
      var prevVelocity = prev && prev.noteon ? prev.expression.velocity : defaults.velocity;

      var info = [];

      event.expression.pitchbend = phrase.pitchbend;
      event.expression.velocity = phrase.velocity;

      expressions.phrase.forEach(function (exp) {
        if (player.annotations[exp] &&
          event.expression.phrase[exp] &&
          (!prev || (prev && prev.noteon && !prev.expression.phrase[exp]))) {

          phrase = _.merge(defaults, player.annotations[exp].state.expression);

          if (phrase.keyswitch) {
            event.expression.keyswitch = phrase.keyswitch;
            info.push({ keyswitch: true, for: exp, phrase: true });
          }
          if (phrase.velocity != prevVelocity && prev) {
            event.expression.velocity = phrase.velocity;
            info.push({ velocity: true, for: exp, phrase: true });
          }
          if (phrase.pitchbend != prevPitchbend) {
            event.expression.pitchbend = phrase.pitchbend;
            info.push({ pitchbend: true, for: exp, phrase: true });
          }

          if (Object.keys(phrase.controller).length) {
            event.expression.controller = phrase.controller;
            info.push({ cc: true, for: exp, phrase: true });
          }

        }
      });


      expressions.preNote.forEach(function (exp) {
        if (player.annotations[exp] &&
          event.expression.note[exp]) {

          var e = player.annotations[exp].state.expression;

          if (e.keyswitch) {
            event.expression.keyswitch = e.keyswitch;
            info.push({ keyswitch: true, for: exp, note: true });
          }
          if (e.velocity != prevVelocity) {
            event.expression.velocity = e.velocity;
            info.push({ velocity: true, for: exp, note: true });
          }
          if (e.pitchbend != prevPitchbend) {
            event.expression.pitchbend = e.pitchbend;
            info.push({ pitchbend: true, for: exp, note: true });
          }
        }
      });

      expressions.postNote.forEach(function (exp) {
        if (player.annotations[exp] &&
          next && next.noteon && next.expression.note[exp]) {

          var e = player.annotations[exp].state.expression;
          if (e.keyswitch) {
            event.expression.keyswitch = e.keyswitch;
            info.push({ keyswitch: true, for: exp, note: true });
          }
        }
      });

      if (event.expression.keyswitch &&
        lastKeySwitch !== event.expression.keyswitch.pitch) {
        sendKeyswitch(
          event.on - 1,
          event.expression.keyswitch.pitch,
          event.expression.keyswitch.char,
          info);
        lastKeySwitch = event.expression.keyswitch.pitch;
      }

      /*
          
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
      */
      if (lastKeySwitch && lastKeySwitch.temp) {
        sendKeyswitch(lastKeySwitch.revert, event.on - 1);
        lastKeySwitch = undefined;
      }

      if (event.expression.dynamics && event.expression.dynamics !== prevDynamics) {
        sendCC(event.on - 1, 1, event.expression.dynamics, info); //INSTRUMENT SPECIFIC
      }

      for (var key in event.expression.controller) {
        console.log(event.expression.controller, 'key');
        sendCC(event.on - 1, parseInt(key, 10), event.expression.controller[key], info); //INSTRUMENT SPECIFIC
      }


      if (event.expression.pitchbend !== prevPitchbend) {
        console.log('send pitchbend');
        sendPitchbend(event.on - 1, event.expression.pitchbend, info);
      }

      /*
            if (event.expression.note.glissando && !prevGlissando) {
              sendPitchbend(0, on - 1, 'glissando'); //INSTRUMENT SPECIFIC
            } else if (prevGlissando) {
              sendPitchbend(8192, on - 1, ' glissando off');
            }
      */

      var off, offInfo;

      if (prev && prev.noteon) {

        if (event.legato) {
          off = event.time.tick + defaults.legato; // legato slight overlap
          offInfo = 'legato';
        } else if (event.staccato) {
          off = prev.time.tick + ((event.time.tick - prev.time.tick) / 2);
          offInfo = 'staccato';
        } else {
          off = event.time.tick + defaults.detach; // default slightly detached
          offInfo = 'detached';
        }

        sendNoteOff(
          off,
          prev.pitch.value,
          prev.pitch.char,
          offInfo)
      }

      sendNoteOn(
        event.on,
        event.pitch.value,
        event.expression.velocity,
        event.pitch.char,
        info);
    }

    if (event.noteoff && prev.noteon) {

      if (prev.staccato) {
        off = event.time.tick - 10;
        offInfo = 'staccato';
      } else {
        off = event.time.tick; // default slightly detached
        offInfo = 'full';
      }
      sendNoteOff(
        off,
        prev.pitch.value,
        prev.pitch.char,
        offInfo);
    }

  });

  return messages;

  function sendNoteOn(tick, pitch, velocity, char, info) {

    var noteInfo = info.filter(function (item) {
      return item.velocity;
    }).map(function (item) { return item.for; })

    noteInfo = noteInfo.length > 1 ? noteInfo.join(', ') : noteInfo.length === 1 ? noteInfo[0] : ''

    messages.push({
      type: 'noteon',
      pitch: pitch,
      velocity: velocity,
      tick: tick,
      channel: player.channel,
      char: char,
      info: noteInfo
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

  function sendCC(tick, number, value, info) {

    var ccInfo
    if (typeof info === 'string') {
      ccInfo = info;
    } else {
      ccInfo = info.filter(function (item) {
        return item.cc;
      }).map(function (item) { return item.for; });

      ccInfo = ccInfo.length > 1 ? ccInfo.join(', ') : ccInfo.length === 1 ? ccInfo[0] : '';
    }

    messages.push({
      type: 'cc',
      controller: number,
      value: value,
      tick: tick,
      channel: player.channel,
      info: ccInfo
    });
  }

  function sendPitchbend(tick, value, info) {

    var pbInfo;
    if (typeof info === 'string') {
      pbInfo = info;
    } else {
      pbInfo = info.filter(function (item) {
        return item.pitchbend;
      }).map(function (item) { return item.for; });

      pbInfo = pbInfo.length > 1 ? pbInfo.join(', ') : pbInfo.length === 1 ? pbInfo[0] : '';

    }

    messages.push({
      type: 'pitch',
      value: value,
      tick: tick,
      channel: player.channel,
      info: pbInfo
    });
  }

  function sendKeyswitch(tick, pitch, char, info) {

    var ksInfo;
    if (typeof info === 'string') {
      ksInfo = info;
    } else {
      ksInfo = info.filter(function (item) {
        return item.keyswitch;
      }).map(function (item) { return item.for; });

      ksInfo = ksInfo.length > 1 ? ksInfo.join(', ') : ksInfo.length === 1 ? ksInfo[0] : ''

    }

    messages.push({
      type: 'noteon',
      pitch: pitch,
      velocity: 64,
      tick: tick,
      channel: player.channel,
      info: ksInfo,
      char,
      keyswitch: true
    });
    messages.push({
      type: 'noteoff',
      pitch: pitch,
      tick: tick + 1,
      channel: player.channel,
      info: ksInfo,
      char,
      keyswitch: true
    });


  }



}

function send(player, conductor) {

  conductor = _.merge({}, conductor); //copy object to avoid mutations splling out
  player = _.merge({}, player);







  var annotations = {};
  for (var key in player.annotations) {
    var state = parse(player.annotations[key], null, player.config.defaults)[0];
    annotations[key] = {
      raw: player.annotations[key],
      state: state
    };
  }
  player.annotations = annotations;

  if (player.annotations.default) {
    player.config.defaults = _.merge(player.config.defaults, player.annotations.default.state.expression);
  }

  player.config.defaults = _.merge({
    velocityBase: 80,
    velocityStep: 10,
    dynamics: 100,
    pitchbend: 8192,
    detach: -5,
    legato: 5,
    legatoTransition: 0
  },
    player.config.defaults);

  var parsed = parse(player.score, conductor, player.config.defaults);
  return generateMessages(player, parsed);
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