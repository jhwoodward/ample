var utils = require('../parserUtils');
var eventType = require('../constants').eventType;
var _ = require('lodash');

function TempoParser() {
  this.type = 'Tempo';
  this.test = /^[\d]{1,3}=T/;
}
TempoParser.prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  mutateState: function (state) {
    state.time.tempo = this.parsed.value;
    state.events.push({
      tick: state.time.tick,
      type: eventType.tempo,
      value: this.parsed.value
    });
  }

}

module.exports = TempoParser;