var _ = require('lodash');
var utils = require('../parserUtils');
var eventType = require('../constants').eventType;
var parser = require('./_parser');

function PitchbendParser() {
  this.type = 'Pitchbend';
  this.test = /^[\d]{1,5}==?P/;
}
var prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  mutateState: function (state) {
    state.pitchbend = this.parsed.value;
  },
  getEvents: function(state, prev) {
    if (prev.pitchbend === this.parsed.value) return [];
    var offset = -1;
    return [{
      offset,
      tick: state.time.tick + offset,
      type: eventType.pitchbend,
      value: this.parsed.value
    }];
  }
}
PitchbendParser.prototype = _.extend({}, parser, prototype);
module.exports = PitchbendParser;