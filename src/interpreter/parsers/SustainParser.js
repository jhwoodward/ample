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
  },
  leave: function(state, next) {
     next.time.tick += next.time.step;
  },
}
SustainParser.prototype = _.extend({}, parser, prototype);
module.exports = SustainParser;