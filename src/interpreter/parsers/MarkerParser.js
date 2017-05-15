var _ = require('lodash');
var parser = require('./_parser');
var utils = require('../parserUtils');
var macroType = require('../constants').macroType;

function MarkerParser(macros) {
  this.type = 'Marker';
  this.substitutions = {};
  if (macros) {
    this.substitutions = macros.reduce(function (acc, item) {
      if (item.type === macroType.substitution) {
        acc[item.key] = item;
      }
      return acc;
    }, {});
  }
}

var prototype = {
  match: function match(s) {
    var startTest = /^\$[a-zA-Z]+(\d+)?\(/.exec(s);
    if (!startTest) return false;

    var markerNameTest = /[a-zA-Z]+/.exec(startTest[0]);
    var name = markerNameTest[0];
    var n = /\d+/.exec(startTest[0]);
    n = n ? parseInt(n[0]) : undefined;
    var parsed = { name, n };
    var bracketed = utils.getBracketed(s, startTest[0].length);
    var part = bracketed;
    if (this.substitutions[part]) {
      parsed.key = part;
      parsed.part = this.substitutions[part].value;
    } else {
      parsed.part = part;
    }

    //TODO: WORK OUT HOW TO DO THIS WHEN YOU HAVE A BRAIN
    parsed.definitionStart = startTest[0].length;


    this.string = startTest[0] + bracketed + ')';
    this.parsed = parsed;
   
    return true;
  },
  mutateState: function (state, interpreter) {

    this.parsed.definitionStart += this.origin.start;//start of token relative to doc
    var origTick = state.time.tick;
    var part = interpreter.parse(this.parsed.part, this.parsed.definitionStart);

    interpreter.master.markers[this.parsed.name].forEach((tick, i) => {
      if (!this.parsed.n) {
        interpreter.next = interpreter.getNextState();
        interpreter.next.time.tick = tick;
        interpreter.generateState(part);
      } else if (i === this.parsed.n - 1) {
        interpreter.next = interpreter.getNextState();
        interpreter.next.time.tick = tick;
        interpreter.generateState(part);
      }
    });

    state.time.tick = origTick;


  },
  continue: true

}
MarkerParser.prototype = _.extend({}, parser, prototype);
module.exports = MarkerParser;