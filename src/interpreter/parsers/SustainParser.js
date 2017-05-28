var _ = require('lodash');
var parser = require('./_parser');

function SustainParser() {
  this.type = 'Sustain';
  this.test = /^\//;
}
var prototype = {
  parse: function (s) {
    return true;
  },
  mutateState: function (state) {

    if (state.on) {
       state.on.duration += state.time.step;
    }
   
  },
  getEvents: function (state, prev, events) {
    var out = [];

    out.push({
      tick: state.time.tick,
      type: 'sustain',
      origin: this.origin //ref to string position
    });
    return out;

  },
  next: function (next) {
    next.time.tick += next.time.step;
  }
}
SustainParser.prototype = _.extend({}, parser, prototype);
module.exports = SustainParser;