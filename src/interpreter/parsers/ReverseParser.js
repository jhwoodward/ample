var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var eventType = require('../constants').eventType;
var State = require('../State');

function ReverseParser(macros) {
  this.type = 'reverse';
  this.test = /^\w+(?!=)/;
  this.sub = true;//for code highlighting
  this.substitutions = {};
  this.reversals = {};
  if (macros) {
    this.substitutions = macros.reduce(function (acc, item) {
      if (item.type === macroType.substitution) {
        acc[item.key] = item;
      }
      return acc;
    }, {});
    this.reversals = macros.reduce(function (acc, item) {
      if (item.type === 'reverse') {
        acc[item.key] = item;
      }
      return acc;
    }, {});
  }
}

var prototype = {
  parse: function (s) {
    var key = /\w+/.exec(s)[0];
    if (this.reversals[key]) {
      return key;
    }
  },
  mutateState: function (state, interpreter) {
    var reverse = this.reversals[this.parsed];

    var sub = this.substitutions[reverse.value];

    var states = [];
    var next = interpreter.next || interpreter.getNextState();// new State();

    var fakeInterpreter = {
      getTopState: function () {
        return states[states.length - 1];
      }
    };
    for (var i = 0; i < sub.parsed.length; i++) {
      var parser = sub.parsed[i];
      var state = next;
      state.mutate(parser, fakeInterpreter);
      states.push(state);
      next = states[states.length - 1].clone();
      if (parser.next) {
        parser.next(next);
      }
    }
    this.startTick = states[0].time.tick;

    console.log(states);
    states.reverse();
    states[0].time.tick = this.startTick;
    states.forEach((s, i) => {
      if (i > 0) {
        var prev = states[i - 1];
        s.time.tick = prev.time.tick;
        if (prev.parser.duration) {
          s.time.tick += prev.parser.duration;
        }
      }
    });
    
   // states = states.filter(s => s.parser.getEvents);
    
    interpreter.appendState(states);

  var finalState = _.cloneDeep(interpreter.getTopState());
    if (finalState.parser.next) {
      finalState.parser.next(finalState);
    }
    this.endTick = finalState.time.tick;

    //// var states = new Interpreter().interpret(sub.value);
    // Can now potentially act on the array of parsers in sub.

    // Would need to generate state from the parsers to get the actual notes
    // Maybe new Interpreter().generateState() ?
    // Then we could transpose, reorder, set to another rhythm etc




  },
  getEvents: function () {
    return [
      {
        tick: this.startTick,
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

ReverseParser.prototype = _.extend({}, parser, prototype);
module.exports = ReverseParser;