var utils = require('../parserUtils');
var eventType = require('../constants').eventType;
var _ = require('lodash');

function ControllerParser() {
  this.type = 'controller';
  this.test = /^[\d]{1,3}==?C[\d]{1,3}/;
}
ControllerParser.prototype = {
  parse: function (s) {
    var out = {
      controller: parseInt(/C[\d]{1,3}/.exec(s)[0].replace('C', ''), 10)
    };
    return Object.assign(out, utils.parseValue(s));
  },
  mutateState: function (state) {
    if (this.parsed.phrase) {
      if (!state.phrase.controller) {
        state.phrase.controller = {};
      }
      state.phrase.controller[this.parsed.controller] = this.parsed.value;
    } else {
      if (!state.note.controller) {
        state.note.controller = {};
      }
      state.note.controller[this.parsed.controller] = this.parsed.value;
    }
    state.events.push({
      tick: state.time.tick-1,
      type: eventType.controller,
      controller: this.parsed.controller,
      value: this.parsed.value
    })
  }
}

module.exports = ControllerParser;