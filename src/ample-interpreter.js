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
  if (parser.cursor < score.length - 3) {
    parser.char4 = score[parser.cursor + 3];
  } else {
    parser.char4 = '';
  }

  parser.char2 = (parser.char + parser.char2).trim();
  parser.char3 = (parser.char2 + parser.char3).trim();
  parser.char4 = (parser.char3 + parser.char4).trim();

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

function isAnnotation(score, parser, phrase, annotations) {
  if (matchStart(parser.char)) {

    var annotation = getAnnotation(score, parser.cursor);
    phrase.name = annotation.name;
    console.log(phrase.name);
    phrase.expression = annotations[phrase.name].expression;
    phrase.legato = phrase.name.indexOf('legato') === 0;
    phrase.staccato = phrase.name.indexOf('staccato') === 0;
    parser.cursor += annotation.length;

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
      name: annotation.trim(),
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
    expression.phrase.velocity = parseInt(parser.numbers.join(''), 10);
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

  var cc = parseInt(parser.char3[2], 10);//will need to extend to allow for >9
  parser.cursor += 3;
  if (parser.char4.length === 4) {
    cc = parseInt(parser.char4[2] + parser.char4[3], 10);
    parser.cursor += 1;
  }
  var value = parseInt(parser.numbers.join(''), 10);

  expression.controller[cc] = value;
  parser.numbers = [];

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

function isAccidentalOrNumeric(parser, pitch) {
  if (isSharp(parser.char)) {
    pitch.accidental++;
    parser.cursor++;
    return true;
  }

  if (isFlat(parser.char)) {
    parser.numbers.push(parser.char);//also represents negative number
    pitch.accidental--;
    parser.cursor++;
    return true;
  }

  if (isNatural(parser.char)) {
    pitch.natural = true;
    parser.cursor++;
    return true;
  }

  if (!isNaN(parser.char)) {
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

function isArticulation(parser, note, annotations) {

  var articulation;
  if (isGlissando(parser.char)) {
    articulation = { name: 'glissando', expression: annotations.glissando.expression };
  }

  if (isLegato(parser.char)) {
    articulation = { name: 'legato', after: true, expression: annotations.legato.expression };
    note.legato = true;
  }

  if (isStaccato(parser.char)) {
    articulation = { name: 'staccato', after: true, expression: annotations.staccato.expression };
    note.staccato = true;
  }

  if (isAccent(parser.char)) {
    articulation = { name: 'accent', expression: annotations.accent.expression };
  }

  if (articulation) {
    note.articulations.push(articulation);
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

function isOnOffset(parser, expression) {

  if (parser.char3 === '=ON') {
    if (parser.numbers.length) {
      expression.on = parseInt(parser.numbers.join(''), 10);
      console.log('xon', expression.on);
      parser.numbers = [];
    }
    parser.cursor += 3;
    return true;
  }

  if (parser.char4 === '=OFF') {
    if (parser.numbers.length) {
      expression.off = parseInt(parser.numbers.join(''), 10);
      parser.numbers = [];
    }
    parser.cursor += 4;
    return true;
  }
}

function parse(score, conductor, annotations, defaultExpression) {
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
      dynamics: defaultExpression.dynamics,
      pitchbend: defaultExpression.pitchbend,
      velocity: defaultExpression.velocity,
      controller: {},
      keyswitch: undefined,
      on: 0, //adjust noteon time in ticks
      off: 0, //adjust noteoff time in ticks
      note: {
        articulations: [],
        legato: false,
        staccato: false
      },
      phrase: {
        name: '',
        expression: defaultExpression,
        legato: false,
        staccato: false
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
    if (isOnOffset(state.parser, state.expression)) continue;
    if (isKeyScale(state.parser, state.key)) continue;
    if (isKeyswitch(score, state.parser, state.time, state.expression)) continue;
    if (isAnnotation(score, state.parser, state.expression.phrase, annotations)) continue;
    if (isTempo(state.parser, state.time)) continue;
    if (isVelocity(state.parser, state.expression)) continue;
    if (isPitchbend(state.parser, state.expression)) continue;
    if (isDynamics(state.parser, state.expression)) continue;
    if (isController(state.parser, state.expression)) continue;
    if (isAccidentalOrNumeric(state.parser, state.pitch)) continue;
    if (isTranspose(state.parser)) continue;
    if (isBeatstep(state.parser, state.time)) continue;
    if (isArticulation(state.parser, state.expression.note, annotations)) continue;
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
      state.expression.note.articulations = [];
      state.expression.note.staccato = false;
      state.expression.note.legato = false;

      //not sure if i need to reset these here
      //reset velocity
      state.expression.velocity = state.expression.phrase.expression.velocity;

      //reset keyswitch
      if (state.expression.keyswitch) {
        state.expression.lastKeyswitch = state.expression.keyswitch;
      }
      state.expression.keyswitch = state.expression.phrase.expression.keyswitch;
      state.expression.pitchbend = state.expression.phrase.expression.pitchbend;

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
  setDefaultExpression(player);

  parsed.forEach(function (event, i) {

    var next = i < parsed.length ? parsed[i + 1] : undefined;
    var prev = i > 0 ? parsed[i - 1] : undefined;
    var info = [];
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
      event.staccato = event.expression.note.staccato || (prev && prev.noteon && prev.expression.phrase.staccato && event.expression.phrase.staccato);

      var phrase = event.expression.phrase.expression;
      var phraseName = event.expression.phrase.name;
      var prevDynamics = prev && prev.noteon ? prev.expression.dynamics : phrase.dynamics;
      var prevPitchbend = prev && prev.noteon ? prev.expression.pitchbend : phrase.pitchbend;
      var prevVelocity = prev && prev.noteon ? prev.expression.velocity : phrase.velocity;

      //   console.log(phrase,'phrase ' + phraseName);

      //    var newAnnotation = event.expression.phrase.annotation && (!prev || event.expression.phrase.annotation !== prev.expression.phrase.annotation);

      //   if (newAnnotation) {
      //     phrase = event.expression.phrase;
      if (phrase.keyswitch) {
        event.expression.keyswitch = phrase.keyswitch;
        info.push({ keyswitch: true, for: phraseName, phrase: true });
      }
      if (phrase.pitchbend !== prevPitchbend) {
        event.expression.pitchbend = phrase.pitchbend;
        info.push({ pitchbend: true, for: phraseName, phrase: true });
      }

      if (Object.keys(phrase.controller).length) {
        event.expression.controller = phrase.controller;
        info.push({ cc: true, for: phraseName, phrase: true });
      }

      console.log('phrase on', phrase.on)
      var newPhraseOn = phrase.on && (prev && prev.noteon && (prev.expression.phrase.expression.on === phrase.on));
      if (newPhraseOn) {
        event.on += phrase.on;
        info.push({ on: true, note: true, for: `${event.expression.phrase.name} (${phrase.on})` });
      }
      console.log('new phrase on', newPhraseOn)

      event.expression.note.articulations.forEach(function (articulation) {
        if (articulation.after) {
          if (articulation.expression.keyswitch) {
            info.push({ keyswitch: true, for: articulation.name, note: true });
            sendKeyswitch(
              event.on - 1,
              articulation.expression.keyswitch.pitch,
              articulation.expression.keyswitch.char,
              info);

            lastKeySwitch = articulation.expression.keyswitch;
            event.expression.keyswitch = undefined;
          }

          if (articulation.expression.on) {
            event.on += articulation.expression.on;
            info.push({ on: true, for: `${articulation.name} (${articulation.expression.on})`, note: true });
          }

          if (articulation.expression.off) {
            next.expression.off += articulation.expression.off;
            info.push({ off: true, for: `${articulation.name} (${articulation.expression.on})`, note: true });
          }

          if (Object.keys(articulation.expression.controller).length) {
            info.push({ cc: true, for: articulation.name, phrase: true });
            for (var key in articulation.expression.controller) {
              sendCC(event.on - 1, parseInt(key, 10), articulation.expression.controller[key], info); //INSTRUM
            }
          }
        }
      });



      event.expression.note.articulations.forEach(function (articulation) {

        if (!articulation.after) {
          if (articulation.expression.keyswitch) {
            event.expression.keyswitch = articulation.expression.keyswitch;
            info.push({ keyswitch: true, for: articulation.name, note: true });
          }
          if (articulation.expression.velocity != prevVelocity) {
            event.expression.velocity = articulation.expression.velocity;
            info.push({ velocity: true, for: articulation.name, note: true });
          }
          if (articulation.expression.pitchbend != prevPitchbend) {
            event.expression.pitchbend = articulation.expression.pitchbend;
            info.push({ pitchbend: true, for: articulation.name, note: true });
          }
        }
      });



      if (event.expression.keyswitch &&
        event.expression.lastKeySwitch.pitch !== event.expression.keyswitch.pitch) {
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
      if (event.expression.lastKeySwitch && event.expression.lastKeySwitch.temp) {
        sendKeyswitch(event.expression.lastKeySwitch.revert, event.on - 1);
        lastKeySwitch = undefined;
      }

      if (event.expression.dynamics && event.expression.dynamics !== prevDynamics) {
        sendCC(event.on - 1, 1, event.expression.dynamics, info); //INSTRUMENT SPECIFIC
      }

      for (var key in event.expression.controller) {
        console.log(event.expression.controller, 'key');
        sendCC(event.on - 1, parseInt(key, 10), event.expression.controller[key], info);
      }


      if (event.expression.pitchbend !== prevPitchbend) {
        console.log('send pitchbend');
        sendPitchbend(event.on - 1, event.expression.pitchbend, info);
      }

      sendNoteOn(
        event.on,
        event.pitch.value,
        event.expression.velocity,
        event.pitch.char,
        info);

      if (prev && prev.noteon) {

        event.off = event.time.tick;
        var shouldAdjustOff = phrase.off && (next && next.noteon && next.expression.phrase.expression.off===phrase.off);
        if (shouldAdjustOff) {
          event.off += phrase.off;
          info.push({ off: true, for: `${event.expression.phrase.name} (${phrase.off})`, phrase: true });
        }
        //not sure about this
        if (prev.expression.off) {
          event.off += prev.expression.off;
          info.push({ off: true, for: `$${event.expression.off}`, phrase: true });
        }

        if (event.staccato) {
          event.off = prev.time.tick + ((event.time.tick - prev.time.tick) / 2);
          info.push({ off: true, for: 'staccato' });
        }

        sendNoteOff(
          event.off,
          prev.pitch.value,
          prev.pitch.char,
          info);
      }

    }

    if (event.noteoff && prev.noteon) {

      if (prev.staccato) {
        event.off = event.time.tick - 10;
        info.push({ off: true, for: 'staccato' });
      } else {
        event.off = event.time.tick; // default slightly detached
        info.push({ off: true, for: 'full' });
      }
      sendNoteOff(
        event.off,
        prev.pitch.value,
        prev.pitch.char,
        info);
    }

  });

  return messages;


  function setDefaultExpression(player) {

    var phrase = _.merge({}, player.config.defaultExpression);
    var info = 'default';

    sendPitchbend(0, phrase.pitchbend, info);

    if (phrase.keyswitch) {
      sendKeyswitch(0, phrase.keyswitch.pitch, phrase.keyswitch.char, info);
    }

    sendCC(0, 1, phrase.dynamics, info);

    for (var key in phrase.controller) {
      sendCC(0, parseInt(key, 10), phrase.controller[key], info);
    }

    return phrase;
  }

  function sendNoteOn(tick, pitch, velocity, char, info) {

    var noteInfo = info.filter(function (item) {
      return item.velocity || item.on;
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

    var noteInfo = info.filter(function (item) {
      return item.off;
    }).map(function (item) { return item.for; })

    noteInfo = noteInfo.length > 1 ? noteInfo.join(', ') : noteInfo.length === 1 ? noteInfo[0] : ''


    messages.push({
      type: 'noteoff',
      pitch: pitch,
      tick: tick,
      channel: player.channel,
      char: char,
      info: noteInfo
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

  player.config = _.merge({
    detach: -5,
    legato: 5,
    legatoTransition: 0,
    defaultExpression: {
      velocity: 80,
      dynamics: 100,
      pitchbend: 8192
    }
  },
    player.config);

  var annotations = {};
  for (var key in player.annotations) {
    var expression = parse(player.annotations[key], null, null, player.config.defaultExpression)[0].expression;
    delete expression.note;
    delete expression.phrase;
    annotations[key] = {
      raw: player.annotations[key],
      expression: expression
    };
  }
  player.annotations = annotations;
  /*
    if (player.annotations.default) {
      player.config.defaults = _.merge(player.config.defaults, player.annotations.default.state.expression);
    }
  */


  var parsed = parse(player.score, conductor, annotations, player.config.defaultExpression);
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