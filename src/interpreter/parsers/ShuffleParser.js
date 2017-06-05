var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var eventType = require('../constants').eventType;
var parserUtils = require('../parserUtils');
var SubInterpreter = require('../SubInterpreter');
var SeededShuffle = require('seededshuffle');

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function ShuffleParser(macros) {
  this.type = 'shuffle';
  this.test = /^shuffle/;

}

var prototype = {
  match: function (s) {
    var startTest = /^shuffle\(/.exec(s);
    if (!startTest) return false;
    var bracketed = parserUtils.getBracketed(s, startTest[0].length);
    if (!bracketed) return false;

    var remainder = s.substring(bracketed.length + startTest[0].length + 1, s.length);
    var seed = /^\#[\d]+/.exec(remainder);
    if (seed) {
      seed = parseInt(seed[0].replace('#', ''), 10)
    }

    this.parsed = {
      part: bracketed,
      seed: seed,
      definitionStart: startTest[0].length
    };
    this.string = startTest[0] + bracketed + ')';
    return true;
  },
  mutateState: function (state, interpreter) {
    var initialState = interpreter.next || interpreter.getNextState();
  //  var modifiers = initialState.modifiers;
  //  initialState.modifiers = [];

    this.startState = initialState;
    var subInterpreter = new SubInterpreter(initialState, interpreter);
    var cursor = this.origin.start + this.parsed.definitionStart;
    var parsers = interpreter.parse(this.parsed.part, cursor);
    var states = subInterpreter.generateState(parsers).filter(s => s.parser.duration);

    var startTick = states[0].time.tick;

    // var pitches = states.map(s => s.pitch);

    //TODO: the origins have to be moved aswell

    if (this.parsed.seed) {
      SeededShuffle.shuffle(states, this.parsed.seed);
    } else {
      states = shuffle(states);
    }


    states[0].time.tick = startTick;
    states.forEach((s, i) => {
      // s.pitch = pitches[i];
      if (i > 0) {
        var prev = states[i - 1];
        s.time.tick = prev.time.tick;
        if (prev.parser.duration) {
          s.time.tick += prev.parser.duration;
        }
      }

      //apply constraints
      if (interpreter && interpreter.master) {
        interpreter.master.states.forEach(function (ms) {
          if (ms.tick <= s.time.tick) {
            _.merge(s, ms.state);
          }
        });
      }

    });


//apply modifers
    states.forEach(s =>
      s.modifiers.filter(m => m.fn).forEach(m => {
        m.fn(s);
      }));

    interpreter.appendState(states);

    interpreter.next = interpreter.getNextState();
   // interpreter.next.modifiers = modifiers;

    var lastParser = interpreter.getTopState().parser;
    if (lastParser.next) {
      lastParser.next(interpreter.next);
    }
    this.endTick = interpreter.next.time.tick;

  },
  getEvents: function () {
    return [
      {
        tick: this.startState.time.tick,
        type: eventType.substitution,
        origin: this.origin //ref to string position
      },
      {
        tick: this.endTick,
        type: eventType.substitutionEnd,
        origin: this.origin
      }
    ];

  },
  continue: true
}

ShuffleParser.prototype = _.extend({}, parser, prototype);
module.exports = ShuffleParser;