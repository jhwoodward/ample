var utils = require('jsmidgen').Util;
var _ = require('lodash');

function parse(score, conduct, annotations) {
  var conductor = _.merge({}, conduct);
  var defaultExpression = {};
  if (annotations) {
    defaultExpression = _.merge({}, annotations.default.expression)
  }

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
      note: {
        articulations: [],
        //  dynamics: defaultExpression.dynamics || 90,
        pitchbend: defaultExpression.pitchbend || 8192,
        velocity: defaultExpression.velocity || 90,
        controller: defaultExpression.controller || {},
        keyswitch: undefined,
        on: 0, //adjust noteon time in ticks
        off: 0, //adjust noteoff time in ticks
      },
      phrase: {
        name: 'default',
        //  dynamics: defaultExpression.dynamics || 90,
        pitchbend: defaultExpression.pitchbend || 8192,
        velocity: defaultExpression.velocity || 90,
        controller: defaultExpression.controller || {},
        keyswitch: undefined,
        on: 0, //adjust noteon time in ticks
        off: 0, //adjust noteoff time in ticks
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
      tick: 50, //start 50 ticks in to allow for on offsets
      step: 48
    }
  }

  while (state.parser.cursor < score.length) {

    score = spliceConductorInstructions(conductor, score, state);
    if (ignore(score, state.parser)) continue;

    parseChars(score, state.parser);
    if (isOnOff(state.parser, state.expression)) continue;
    if (isKeyScale(state.parser, state.key)) continue;
    if (isKeyswitch(score, state.parser, state.time, state.expression)) continue;
    if (isAnnotation(score, state.parser, state.expression, annotations)) continue;
    if (isTempo(state.parser, state.time)) continue;
    if (isVelocity(state.parser, state.expression)) continue;
    if (isPitchbend(state.parser, state.expression)) continue;
    // if (isDynamics(state.parser, state.expression)) continue;
    if (isController(state.parser, state.expression)) continue;
    if (isAccidentalOrNumeric(state.parser, state.pitch)) continue;
    if (isTranspose(state.parser, state.pitch)) continue;
    if (isBeatstep(state.parser, state.time)) continue;
    if (isArticulation(state.parser, state.expression, annotations)) continue;
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

      //reset note expressions to phrase
      state.expression.note = _.merge({}, state.expression.phrase);
      state.expression.note.articulations = [];

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

function isPortamento(char) {
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

  if (parser.cursor < score.length - 4) {
    parser.char5 = score[parser.cursor + 4];
  } else {
    parser.char5 = '';
  }

  parser.char2 = (parser.char + parser.char2);//.trim();
  parser.char3 = (parser.char2 + parser.char3);//.trim();
  parser.char4 = (parser.char3 + parser.char4);//.trim();
  parser.char5 = (parser.char4 + parser.char5);//.trim();

  return parser;
}

function spliceConductorInstructions(conductor, score, state) {
  var beat = Math.round(state.time.tick / 48);
  if (conductor[beat]) {
    score = splice(score, state.parser.cursor, conductor[beat]);
    console.log(score, 'spliced');
    delete conductor[beat];
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
    expression.phrase.keyswitch = ks;
    expression.note.keyswitch = ks;
    parser.cursor += ks.length;
    return true;
  }

  return false;

  function isStartKeySwitch(char) {
    return char === '[';
  }

}

function isAnnotation(score, parser, expression, annotations) {
  if (matchStart(parser.char)) {

    var annotation = getAnnotation(score, parser.cursor);

    if (annotation.expression) {
      expression.phrase = _.merge({}, annotations[annotation.name].expression);
      expression.phrase.name = annotation.name;
    }

    if (annotation.animation) {
      //if trigger = noteon attach animation to phrase
      //otherwise push events relative to current time
      /*
      var event = {
        controller: true,
        time: ,
        number: ,
        value
  
      }*/
      // parsed.push(event);
    }

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
  if (matchPhrase(parser.char3)) {
    expression.phrase.velocity = parseInt(parser.numbers.join(''), 10);
    expression.note.velocity = parseInt(parser.numbers.join(''), 10);
    parser.numbers = [];
    parser.cursor += 3;
    return true;
  }
  if (matchNote(parser.char2)) {
    expression.note.velocity = parseInt(parser.numbers.join(''), 10);
    parser.numbers = [];
    parser.cursor += 2;
    return true;
  }
  return false;

  function matchNote(chars) {
    return chars === '=V';
  }

  function matchPhrase(chars) {
    return chars === '==V';
  }
}

function isPitchbend(parser, expression) {

  if (matchPhrase(parser.char3)) {
    expression.phrase.pitchbend = parseInt(parser.numbers.join(''), 10);
    parser.numbers = [];
    parser.cursor += 3;
    return true;
  }
  if (matchNote(parser.char2)) {
    expression.note.pitchbend = parseInt(parser.numbers.join(''), 10);
    parser.numbers = [];
    parser.cursor += 2;
    return true;
  }

  function matchNote(chars) {
    return chars === '=P';
  }

  function matchPhrase(chars) {
    return chars === '==P';
  }

}

function isController(parser, expression) {
  if (matchPhrase(parser.char3)) {
    var cc = parseInt(parser.char4[3], 10);//will need to extend to allow for >99
    parser.cursor += 4;
    if (parser.char5.length === 5) {
      cc = parseInt(parser.char4[3] + parser.char5[4], 10);
      parser.cursor += 1;
    }
    var value = parseInt(parser.numbers.join(''), 10);

    expression.phrase.controller[cc] = value;
    parser.numbers = [];

    return true;

  }

  if (matchNote(parser.char2)) {

    var cc = parseInt(parser.char3[2], 10);//will need to extend to allow for >99
    parser.cursor += 3;
    if (parser.char4.length === 4) {
      cc = parseInt(parser.char3[2] + parser.char4[3], 10);
      parser.cursor += 1;
    }
    var value = parseInt(parser.numbers.join(''), 10);

    expression.note.controller[cc] = value;
    parser.numbers = [];

    return true;

  }

  function matchPhrase(chars) {
    return chars === '==C';
  }

  function matchNote(chars) {
    return chars === '=C';
  }
}
/*
function isDynamics(parser, expression) {

  if (matchPhrase(parser.char3)) {
    expression.phrase.dynamics = parseInt(parser.numbers.join(''), 10);//for accents driven by cc
    //also allow phrase dynamics with =LP
    parser.numbers = [];
    parser.cursor += 3;
    return true;
  }

  if (matchNote(parser.char2)) {
    expression.note.dynamics = parseInt(parser.numbers.join(''), 10);//for accents driven by cc
    //also allow phrase dynamics with =LP
    parser.numbers = [];
    parser.cursor += 2;
    return true;
  }



  function matchNote(chars) {
    return chars === '=L';
  }

  function matchPhrase(chars) {
    return chars === '==L';
  }
}
*/

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
      pitch.accidental = 0;
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

function isArticulation(parser, expression, annotations) {

  var articulation;
  if (isPortamento(parser.char)) {
    articulation = { name: 'portamento', expression: annotations.portamento.expression };
  }

  if (isLegato(parser.char)) {
    articulation = { name: 'legato', expression: annotations.legato.expression };
  }

  if (isStaccato(parser.char)) {
    articulation = { name: 'staccato', expression: annotations.staccato.expression };
  }

  if (isAccent(parser.char)) {
    articulation = { name: 'accent', expression: annotations.accent.expression };
  }

  if (articulation) {
    expression.note.articulations.push(articulation);
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

function isOnOff(parser, expression) {

  if (parser.char3 === '=ON') {
    if (parser.numbers.length) {
      expression.note.on = parseInt(parser.numbers.join(''), 10);
      // console.log('xon', expression.on);
      parser.numbers = [];
    }
    parser.cursor += 3;
    return true;
  }
  if (parser.char3 === '==ON') {
    if (parser.numbers.length) {
      expression.phrase.on = parseInt(parser.numbers.join(''), 10);
      // console.log('xon', expression.on);
      parser.numbers = [];
    }
    parser.cursor += 4;
    return true;
  }

  if (parser.char4 === '=OFF') {
    if (parser.numbers.length) {
      expression.note.off = parseInt(parser.numbers.join(''), 10);
      parser.numbers = [];
    }
    parser.cursor += 4;
    return true;
  }

  if (parser.char5 === '==OFF') {
    if (parser.numbers.length) {
      expression.phrase.off = parseInt(parser.numbers.join(''), 10);
      parser.numbers = [];
    }
    parser.cursor += 5;
    return true;
  }

}

module.exports = parse;
