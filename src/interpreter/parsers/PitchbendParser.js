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
    if (this.parsed.phrase) {
      state.phrase.pitchbend = this.parsed.value;
    } else {
      state.note.pitchbend = this.parsed.value;
    }
    state.events.push({
      tick: state.time.tick,
      type: eventType.pitchbend,
      value: this.parsed.value
    });
  }
}
PitchbendParser.prototype = _.extend({}, parser, prototype);
module.exports = PitchbendParser;