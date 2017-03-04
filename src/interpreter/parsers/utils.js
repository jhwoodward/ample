
var api = {
   parseValue: s => {
    const value = parseInt(/[\d]{1,3}/.exec(s)[0], 10);
    const phrase = s.indexOf('==') > -1;
    if (phrase) {
      return { value, phrase };
    } else {
      return { value };
    }
  },
  parseArtic: s => {
    const artic = /[>'~_]/.exec(s) ? /[>'~_]/.exec(s)[0] : false;
    return {
      accent: artic === '>',
      portamento: artic === '~',
      staccato: artic === '\'',
      legato: artic === '_'
    };
  },
  parsePitch: s => {
    var char = /[a-zA-Z]/.exec(s)[0];
    var octJump = s.match(/!/g);
    return {
      down: char === char.toLowerCase(),
      up: char === char.toUpperCase(),
      octJump: octJump ? octJump.length : false
    };
  },
  strip: obj => {
    for (var key in obj) {
      if (!obj[key]) {
        delete obj[key];
      }
    }
    return obj;
  },
  parseOctave: s => {
    var result = /\-?[0-4]:/.exec(s);
    if (!result) {
      return false;
    }
    return {
      octave: parseInt(result[0].replace(':', ''), 10)
    };
  },
  parseNote: s => {
    var out = {
      flat: s.indexOf('-') > -1,
      sharp: s.indexOf('+') > -1,
      char: /[A-Ga-g]/.exec(s)[0]
    };
    return api.strip(out);
  },
  parseNotes: s => {
    var xArray; 
    var out = [];
    var re = /(?:[+-]?[A-Ga-g])/g;
    var note;
    while (xArray = re.exec(s)) {
      note = xArray[0];
      out.push(api.parseNote(note));
    }
    return out;
  }
};

module.exports = api;