var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var eventType = require('../constants').eventType;
var parserUtils = require('../parserUtils');
var SubInterpreter = require('../SubInterpreter');

function InvertParser(macros) {
  this.type = 'invert';
  this.test = /^invert/; ///for code highlighting only
}

var prototype = {
  match: function match(s) {
    var startTest = /^invert\(/.exec(s);
    if (!startTest) return false;
    var bracketed = parserUtils.getBracketed(s, startTest[0].length);
    if (!bracketed) return false;
    this.parsed = {
      part: bracketed,
      definitionStart: startTest[0].length
    };
    this.string = startTest[0] + bracketed + ')';
    return true;
  },
  mutateState: function (state, interpreter) {

    var initialState = _.cloneDeep(interpreter.next || interpreter.getNextState());
  //  var modifiers = initialState.modifiers;
  //  initialState.modifiers = [];
    var subInterpreter = new SubInterpreter(initialState, interpreter);
    var cursor = this.origin.start + this.parsed.definitionStart;
    var parsers = interpreter.parse(this.parsed.part, cursor);
    var states = subInterpreter.generateState(parsers).filter(s => s.parser.duration);
    this.startTick = states[0].time.tick;


    var inverted = [states[0]];

    states.forEach((s, i) => {
      if (i > 0) {

        var interval = states[i].pitch.value - states[i - 1].pitch.value;

        var inv = _.cloneDeep(states[i]);
        inv.pitch.value = inverted[i - 1].pitch.value - interval;
        inverted.push(inv);
      //  inverted.modifiers = modifiers;
        /// s.time.tick = prev.time.tick;
        // s.time.tick += prev.parser.duration;
      }

         //apply constraints
      if (interpreter && interpreter.master) {
        interpreter.master.states.forEach(function (ms) {
          if (ms.tick <= inverted[i].time.tick) {
            _.merge(inverted[i], ms.state);
          }
        });
      }

    });

    inverted.forEach(s =>
      s.modifiers.filter(m => m.fn).forEach(m => {
        m.fn(s);
      }));

    interpreter.appendState(inverted);
/*
    interpreter.next = interpreter.getNextState();
  //  interpreter.next.modifiers = modifiers;

  
    var lastParser = inverted[inverted.length-1].parser;
    if (lastParser.next) {
      lastParser.next(interpreter.next);
    }
*/
    this.endTick = inverted[inverted.length-1].time.tick + inverted[inverted.length-1].parser.duration;


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

InvertParser.prototype = _.extend({}, parser, prototype);
module.exports = InvertParser;