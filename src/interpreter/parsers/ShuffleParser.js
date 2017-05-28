var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var eventType = require('../constants').eventType;
var State = require('../State');

function ShuffleParser(macros) {
  this.type = 'shuffle';
  this.test = /^\w+(?!=)/;
  this.substitutions = {};
  this.shuffles = {};
  if (macros) {
    this.substitutions = macros.reduce(function (acc, item) {
      if (item.type === macroType.substitution) {
        acc[item.key] = item;
      }
      return acc;
    }, {});
    this.shuffles = macros.reduce(function (acc, item) {
      if (item.type === 'shuffle') {
        acc[item.key] = item;
      }
      return acc;
    }, {});
  }
}

var prototype = {
  parse: function (s) {
    var key = /\w+/.exec(s)[0];
    if (this.shuffles[key]) {
      return key;
    }
  },
  mutateState: function (state, interpreter) {
    this.startState = _.clone(state);
    var shuffle = this.shuffles[this.parsed];

    var sub = this.substitutions[shuffle.value];

    var states = [];
    var next = interpreter.getTopState();// new State();

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
    var startTick = states[0].time.tick;

    console.log(states);
    states.reverse();
    states[0].time.tick = startTick;
    states.forEach((s, i) => {
      if (i > 0) {
        var prev = states[i - 1];
        s.time.tick = prev.time.tick;
        if (prev.parser.duration) {
          s.time.tick += prev.parser.duration;
        }
      }
    });
    console.log(states);
    interpreter.appendState(states);

    //// var states = new Interpreter().interpret(sub.value);
    // Can now potentially act on the array of parsers in sub.

    // Would need to generate state from the parsers to get the actual notes
    // Maybe new Interpreter().generateState() ?
    // Then we could transpose, reorder, set to another rhythm etc




  },
  getEvents: function () {
    return [];
    /*
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
    */

  },
  continue: true
}

ShuffleParser.prototype = _.extend({}, parser, prototype);
module.exports = ShuffleParser;