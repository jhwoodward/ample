var parsers = require('./parsers/parsers');
var parserUtils = require('./parsers/parserUtils');
var State = require('./State');

var _ = require('lodash');


function Interpreter(macros, annotations) {
  this.macros = {};
  this.annotations = {
    default: {
      name: 'default',
      pitchbend: 8192,
      velocity: 90,
      controller: {},
      keyswitch: undefined,
      on: 0,
      off: -5
    }
  };

  for (var key in macros) {
    this.macros[key] = this.parse(macros[key]);
  }
  if (annotations.default) {
    this.annotations.default = _.merge(this.annotations.default,parserUtils.strip(this.interpret(annotations.default).finalState.note));
  }

  for (var key in annotations) {
    if (key !== 'default') {
      this.annotations[key] = parserUtils.strip(this.interpret(annotations[key]).finalState.phrase);
      this.annotations[key].name = key;
      delete this.annotations[key].pitch;
    }

  }
}

/*
  Returns an array of parsers who's regex's match the part string
*/
Interpreter.prototype.parse = function (part) {
  var parsers = [], parser;
  var cursor = 0;
  while (part.length && parsers.length < 9999999) {
    parser = this.findMatch(part);
    if (parser) {
      parsers.push(parser);
      part = part.substring(parser.string.length, part.length);
    } else {
      parsers.push(null);
      part = part.substring(1, part.length)
    }
  }
  return parsers.filter(a => !!a);
}

/*
  Returns the first parser who's regex matchs the part string
*/
Interpreter.prototype.findMatch = function (part) {
  var result, parser;
  for (var i = 0; i < parsers.length; i++) {
    parser = new parsers[i]();
    result = parser.match(part);
    if (result) {
      break;
    }
  }
  if (!result) return undefined;
  return parser;
}

Interpreter.prototype.process = function (parsers) {
  var prev;

  parsers.forEach(function(parser) {

    var state = this.state.clone();

    if (prev && prev.after) {
      prev.after(state);
    }
    /*
    if (parser.type === 'Macro' && this.macros[parser.parsed.id]) {
      if (this.state.context.length < 10) {
        this.state.context.push(parser.parsed.id);
        this.process(this.macros[parser.parsed.id]);
        this.state.context.pop();
      }
    } else {
     
    }*/
    parser.mutateState(state, this.annotations);
    if (parser.before) {
      parser.before(this.state, state);
    }
    this.state = state;
    this.states.push(this.state);
    prev = parser;
  }.bind(this));
}

Interpreter.prototype.interpret = function (part, defaultExpression) {
  this.states = [];
  this.events = [];
  this.state = new State(this.annotations.default);
  this.state.context = ['root'];
  this.process(this.parse(part));
  return {
    states: this.states,
    finalState: this.state
  };
}


var macros = {
  part1: 'abcdefg {part2}',
  part2: 'aaa {part1} b'
};

var annotations = {
  default: '[-3:C] 85=C1 8192=P 0=ON -5=OFF',
  staccato: '[-3:+D]',
  detached: '[-3:C] 8192=P 0=ON -5=OFF',
  legato: '[-3:C] 8192=P -7=ON 5=OFF',
  legatoslow: '[-3:C] 8192=P -7=ON 5=OFF',
  legatononvib: '[-3:+C] -7=ON 5=OFF',
  spiccato: '[-3:D]',
  spic: '[-3:D]',
  pizzicato: '[-3:E] 50=V',
  pizz: '[-3:E]',
  accent: '120=V',
  portamento: '0=P'
};


var interpreter = new Interpreter(macros, annotations);

var result = interpreter.interpret('120=T {legato} abc {part1} S(-A+BCD)S 3@ 50==C1 [-3:+A] a~-b//^!!!c 48, {staccato} -2:defg');

sendEvents(result);

function sendEvents(result) {

  var events = [];
  var events = result.states.reduce(function(acc, item){
    acc = acc.concat(item.events);
    return acc;
  },[]).sort(function(a,b){
    return a.tick > b.tick ? 1 : -1;
  })

  console.log(events);

}


