function Parser(rules) {

  const parseValue = s => {
    const value = parseInt(/[\d]{1,3}/.exec(s)[0], 10);
    const phrase = s.indexOf('==') > -1;
    if (phrase) {
      return { value, phrase };
    } else {
      return { value };
    }
  };

  const parseArtic = s => {
    const artic = /[>'~_]/.exec(s) ? /[>'~_]/.exec(s)[0] : false;
    return {
      accent: artic === '>',
      portamento: artic === '~',
      staccato: artic === '\'',
      legato: artic === '_'
    };
  }

  const parsePitch = s => {
    var char = /[a-zA-Z]/.exec(s)[0];
    return {
      down: char === char.toLowerCase(),
      up: char === char.toUpperCase(),
      octJump: !!/!/.exec(s)
    };
  }

  const strip = obj => {
    for (var key in obj) {
      if (!obj[key]) {
        delete obj[key];
      }
    }
    return obj;
  }

  this.rules = rules;
  this.matches = [
    {
      type: 'macro',
      test: /^{\w+}/
    },
    {
      type: 'note',
      test: /^[>'~_]?\!?\+?\-?\=?[a-gA-G]/,
      parse: s => {
        var acc = /[+-=]/.exec(s) ? /[+-=]/.exec(s)[0] : false;
        var out = {
          char: /[a-gA-G]/.exec(s)[0].toUpperCase(),
          flat: acc === '-',
          sharp: acc === '+',
          natural: acc === '=',
        };
        Object.assign(out,parseArtic(s),parsePitch(s));
        return strip(out);
      },
      process: part => {

      }
    },
    {
      type: 'relativeNote',
      test: /^[>'~_]?\!?\+*\-*[x-zX-Z]/,
      parse: s => {
        var acc = /[+-=]/.exec(s) ? /[+-=]/.exec(s)[0] : false;
        var out = {
 
        };
        Object.assign(out,parseArtic(s),parsePitch(s));
        return strip(out);
      }
    },
    {
      type: 'rest',
      test: /^\^/
    },
    {
      type: 'sustain',
      test: /^\//
    },
    {
      type: 'velocity',
      test: /^[\d]{1,3}==?V/,
      parse: parseValue
    },
    {
      type: 'pitchbend',
      test: /^[\d]{1,3}==?P/,
      parse: parseValue
    },
    {
      type: 'controller',
      test: /^[\d]{1,3}==?C[\d]{1,3}/,
      parse: s => {
        var out = parseValue(s);
      }
    },
    {
      type: 'transpose',
      test: /^-?[\d]{1,3}@/
    },
    {
      type: 'tempo',
      test: /^[\d]{1,3}=T/,
      parse: parseValue
    },
    {
      type: 'duration',
      test: /^[\d]{1,3},/
    },
    {
      type: 'octave',
      test: /^\-?[0-4]:/
    },
    {
      type: 'key',
      test: /^K\((?:[+-][A-G])+\)K/
    },
    {
      type: 'scale',
      test: /^S\((?:[+-]?[A-G])+\)S/
    },
    {
      type: 'keyswitch',
      test: /^\[(?:\-?[0-4]:)?[+-]?[A-G]\]/
    }
  ]
};

Parser.prototype = {
  test: function (part) {
    var result;
    for (var i = 0; i < this.matches.length; i++) {
      var item = this.matches[i];
      result = item.test.exec(part);
      if (result) {
        break;
      }
    }
    if (!result) return undefined;
    return Object.assign({}, item, { s: result[0], length: result[0].length });

  },
  parse: function (part) {
    var instructions = [], instruction;
    var cursor = 0;
    while (part.length && instructions.length < 100) {
      instruction = this.test(part);

      if (instruction) {
        if (instruction.parse) {
          instruction.parsed = instruction.parse(instruction.s);
        }
        instructions.push(instruction);

        part = part.substring(instruction.length, part.length);
      } else {
        instructions.push(null);
        part = part.substring(1, part.length)
      }

    }
    return instructions.filter(i => !!i);
  }
}

var parser = new Parser();
console.log(parser.parse('120=T {part1} [-2:+A] a~-b!c 48, 3:defg'));

module.exports = Parser;



