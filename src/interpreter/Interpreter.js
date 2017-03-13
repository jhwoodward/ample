var parsers = require('./parsers');
var parserUtils = require('./parserUtils');
var State = require('./State');
var seq = require('../sequencer');
var macroType = require('./constants').macroType;

var _ = require('lodash');


function Interpreter(macros) {
  this.macros = macros;

  this.macros.forEach(macro => {
    switch (macro.type) {
      case macroType.substitution:
        macro.parsed = this.parse(macro.value);
        break;
      case macroType.annotation:
        macro.parsed = parserUtils.strip(this.interpret(macro.value).finalState.phrase);
        delete macro.parsed.pitch;
        if (key === 'default') {
          this.defaultPhrase = macro.parsed;
        }
        break;
      case macroType.articulation:
        macro.parsed = parserUtils.strip(this.interpret(macro.value).finalState.phrase);
        delete macro.parsed.pitch;
    }
  });

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
    parser = new parsers[i](this.macros);
    result = parser.match(part);
    if (result) {
      break;
    }
  }
  if (!result) return undefined;
  return parser;
}

Interpreter.prototype.process = function (parsers) {

  parsers.forEach(function (parser, i) {

    var state = this.state.clone();

    if (i > 0 && parsers[i - 1].leave) {
      parsers[i - 1].leave(this.state, state);
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
    parser.mutateState(state);

    if (parser.enter) {
      parser.enter(state, this.state);
    }
    this.state = state;
    this.states.push(this.state);
  }.bind(this));
}

Interpreter.prototype.interpret = function (part) {
  this.states = [];
  this.events = [];
  this.state = new State(this.defaultPhrase);
  this.state.context = ['root'];
  this.process(this.parse(part));
  return {
    states: this.states,
    finalState: this.state
  };
}


var substitutions = {
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

var articulations = {
  '>': annotations.accent,
  '~': annotations.portamento,
  '_': annotations.legato,
  '\'': annotations.staccato
}


function buildMacros(substitutions, annotations, articulations) {
  var macros = [];

  for (var key in annotations) {
    var macro = {
      type: macroType.annotation,
      key: key,
      value: annotations[key]
    }
    macros.push(macro);
  }
  for (var key in articulations) {
    var macro = {
      type: macroType.articulation,
      key: key,
      value: articulations[key]
    }
    macros.push(macro);
  }
  for (var key in substitutions) {
    var macro = {
      type: macroType.substitution,
      key: key,
      value: substitutions[key]
    }
    macros.push(macro);
  }

  return macros;

}

var interpreter = new Interpreter(buildMacros(substitutions, annotations, articulations));

var result = interpreter.interpret('120=T {legato} abc {part1} S(-A+BCD)S 3@ 50==C1 [-3:+A] a~-b//^!!!c 48, {staccato} -2:defg');

sendEvents(result);

function sendEvents(result) {

  var events = [];
  var events = result.states.reduce(function (acc, item) {
    acc = acc.concat(item.events);
    return acc;
  }, []).sort(function (a, b) {
    return a.tick > b.tick ? 1 : -1;
  });

  events = events.map(e => {
    e.channel = 0;
    return e;
  });

  console.log(events);
  seq.start(events);


}


