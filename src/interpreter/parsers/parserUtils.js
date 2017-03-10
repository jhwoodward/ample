var _ = require('lodash');

var api = {
   parseValue: s => {
    const value = parseInt(/-?[\d]{1,4}/.exec(s)[0], 10);
    const phrase = s.indexOf('==') === -1;
    // now using ==V inline 
    if (phrase) {
      return { value, phrase };
    } else {
      return { value };
    }
  },
  parseArtic: s => {
    var xArray;
    var artic;
    var re = /[>'~_]/g;
    var out = [];
    while (xArray = re.exec(s)) {
      artic = xArray[0];
      switch (artic) {
        case '>':
        out.push('accent');
        break;
        case '~':
        out.push('portamento');
        break;
        case '\'':
        out.push('staccato');
        break;
        case '_':
        out.push('legato');
        break;
      }
    }
    return out;
  },
  parsePitch: s => {
    var char = /[a-gA-Gx-zX-Z]/.exec(s)[0];
    var octJump = s.match(/!/g);
    var out = {
      char: char,
      down: char === char.toLowerCase(),
      up: char === char.toUpperCase(),
      octJump: octJump ? octJump.length : false
    };
    return api.strip(out);
  },
  strip: obj => {
    var out = {};
    for (var key in obj) {
      if (obj[key] !== undefined 
      && obj[key] !== false 
      && obj[key] !== null 
      && !(typeof obj[key] === 'object' && _.isEmpty(obj[key]))
      ) {
        out[key] = obj[key];
      }
    }
    return out;
  },
  parseOctave: s => {
    var result = /\-?[0-4]:/.exec(s);
    if (!result) {
      return false;
    }
    return {
      octave: parseInt(result[0].replace(':', ''), 10) + 4
    };
  },
  parseNote: s => {
    var octJump = s.match(/!/g);
    var char = /[A-Ga-g]/.exec(s)[0];
    var out = {
      flat: s.indexOf('-') > -1,
      sharp: s.indexOf('+') > -1,
      char: char.toUpperCase(),
      accidental: 0,
      down: char === char.toLowerCase(),
      up: char === char.toUpperCase(),
      octJump: octJump ? octJump.length : false
    };     
    out.string= out.char + (out.flat ? 'b':out.sharp ? '#' :'');
    if (out.sharp) {
      out.accidental ++;
    }
    if (out.flat) {
      out.accidental --;
    }
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