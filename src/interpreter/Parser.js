function Parser(rules) {

  this.rules = rules;
 
  this.matches = [
    { 
      id: 'macro',
      test: /^{\w+}/
    },
    {
      id: 'note',
      test: /^[>'~_]?\!?\+?\-?\=?[a-gA-G]/
    },
    {
      id: 'relativeNote',
      test: /^[>'~_]?\!?\+*\-*[x-zX-Z]/
    },
    {
      id: 'rest',
      test: /^\^/
    },
    {
      id: 'sustain',
      test: /^\//
    },
    {
      id: 'velocity',
      test: /^[\d]{1,3}==?V/
    },
    {
      id: 'pitchbend',
      test: /^[\d]{1,3}==?P/
    },
    {
      id: 'controller',
      test: /^[\d]{1,3}==?C[\d]{1,3}/
    },
    {
      id: 'transpose',
      test: /^-?[\d]{1,3}@/
    },
    {
      id: 'tempo',
      test: /^[\d]{1,3}=T/
    },
    {
      id: 'duration',
      test: /^[\d]{1,3},/
    },
    {
      id: 'octave',
      test: /^\-?[0-4]:/
    },
    {
      id: 'key', 
      test: /^K\((?:[+-][A-G])+\)K/
    },
    {
      id: 'scale', 
      test: /^S\((?:[+-]?[A-G])+\)S/
    },
    {
      id: 'keyswitch',
      test: /^\[[+-]?[A-G]\]/
    }
 


  ]
}

Parser.prototype = {
  test: function(part) {

    var result;
    for (var i = 0; i < this.matches.length; i++) {
      var item = this.matches[i];
      result = item.test.exec(part);
      if (result) {
        break;
      }
    }
    if (!result) return undefined;
    return {
      type: item.id,
      value: result[0],
      length: result[0].length
    };
  },
  parse: function(part) {
    var instructions = [], instruction;
    var cursor = 0;
    while (part.length && instructions.length < 100) {
      instruction = this.test(part);
     
      if (instruction) {
        console.log(instruction);
       // console.log(part);
        instructions.push(instruction);
        part = part.substring(instruction.length, part.length);
      } else {
       // console.log('nothing');
         instructions.push('nothing');
        part = part.substring(1, part.length)
      }
     
    }
    return instructions;
  }
}

var parser = new Parser();
parser.parse('120=T a-bc 48, 3:defg');

module.exports = Parser;



