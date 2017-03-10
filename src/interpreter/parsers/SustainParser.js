var _ = require('lodash');

function SustainParser() {
  this.type = 'sustain';
  this.test = /^\//;
}
SustainParser.prototype = {
  parse: function (s) {
    return {sustain: true};
  },
  mutateState: function (state) {
  },
  after: function(state) {
     state.time.tick += state.time.step;
  },
}

module.exports = SustainParser;