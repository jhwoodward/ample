var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var eventType = require('../constants').eventType;
var parserUtils = require('../parserUtils');
var SubInterpreter = require('../SubInterpreter');

function PingpongParser(macros) {
  this.type = 'pingpong';
  this.test = /^pingpong/; ///for code highlighting only
}

var prototype = {
  match: function match(s) {
    var startTest = /^pingpong\(/.exec(s);
    if (!startTest) return false;
    var bracketed = parserUtils.getBracketed(s, startTest[0].length);
    if (!bracketed) return false;
    var remainder = s.substring(bracketed.length + startTest[0].length + 1, s.length);
   // if (!remainder.length) return false;
    var count = /^( ?)\*( ?)[\d]+/.exec(remainder);
    if (!count) {
      count = 1;
    } else {
      count  = parseInt(count[0].replace('*', ''), 10)
    }
    this.parsed = {
      part: bracketed,
      count: count,
      definitionStart: startTest[0].length
    };
    this.string = startTest[0] + bracketed + ')';
    return true;
  },
  parse: function (s) {
    var key = /\w+/.exec(s)[0];
    if (this.reversals[key]) {
      return key;
    }
  },
  mutateState: function (state, interpreter) {

    var initialState = interpreter.next || interpreter.getNextState();
    var subInterpreter = new SubInterpreter(initialState, interpreter);
    var cursor = this.origin.start + this.parsed.definitionStart;
    var parsers = interpreter.parse(this.parsed.part, cursor);
    var ping = subInterpreter.generateState(parsers).filter(s => s.parser.duration);

    var lastPong = [].concat(_.cloneDeep(ping)).reverse();
    lastPong.shift();
    var midPong = [].concat(_.cloneDeep(ping)).reverse()
    midPong.shift();
    midPong.pop();
   
    this.startTick = ping[0].time.tick;

    var states = [];
    for (var i=1; i <= this.parsed.count; i++ ){
      states = states.concat(_.cloneDeep(ping));
      if (i === this.parsed.count) {
        states = states.concat(_.cloneDeep(lastPong));
      } else {
        states = states.concat(_.cloneDeep(midPong));
      }
    
    }

    states[0].time.tick = this.startTick;
    states.forEach((s, i) => {
      if (i > 0) {
        var prev = states[i - 1];
        s.time.tick = prev.time.tick;
        s.time.tick += prev.parser.duration;
      }
    });

    interpreter.appendState(states);

    var finalState = _.cloneDeep(interpreter.getTopState());
    if (finalState.parser.next) {
      finalState.parser.next(finalState);
    }
    this.endTick = finalState.time.tick;

    //  transpose, reorder, set to another rhythm etc




  }
  /*
  ,
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

  }*/,
  continue: true
}

PingpongParser.prototype = _.extend({}, parser, prototype);
module.exports = PingpongParser;