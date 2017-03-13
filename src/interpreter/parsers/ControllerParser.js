var utils = require('../parserUtils');
var parser = require('./_parser');
var eventType = require('../constants').eventType;
var _ = require('lodash');

function ControllerParser() {
  this.type = 'Controller';
  this.test = /^[\d]{1,3}==?C[\d]{1,3}/;
}
var prototype = {
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
      tick: state.time.tick,
      type: eventType.controller,
      controller: this.parsed.controller,
      value: this.parsed.value
    })
  }
};

ControllerParser.prototype = _.extend({}, parser, prototype);

module.exports = ControllerParser;