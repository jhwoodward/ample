var utils = require('../parserUtils');
var eventType = require('../constants').eventType;
var _ = require('lodash');
var parser = require('./_parser');

function TempoParser() {
  this.type = 'Tempo';
  this.test = /^[\d]{1,3}=T/;
}
var prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  mutateState: function (state) {
    state.time.tempo = this.parsed.value;
  },
  getEvents: function (state) {
    if (state.time.tempo !== this.parsed.value) {
      return [{
        tick: state.time.tick,
        type: eventType.tempo,
        value: this.parsed.value
      }];
    } else {
      return [];
    }
  }

}
TempoParser.prototype = _.extend({}, parser, prototype);
module.exports = TempoParser;