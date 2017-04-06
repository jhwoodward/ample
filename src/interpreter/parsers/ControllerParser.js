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
    state.controller[this.parsed.controller] = this.parsed.value;
  },
  getEvents: function (state) {
    var event = {
      offset: -1,
      type: eventType.controller,
      controller: this.parsed.controller,
      value: this.parsed.value
    };
    if (state) {
      event.tick = state.time.tick + event.offset;
    }
    return [event];
  },
  compare: function(parser) {
    return (parser.type === 'Controller' && parser.parsed.controller === this.parsed.controller);
  }
};

ControllerParser.prototype = _.extend({}, parser, prototype);

module.exports = ControllerParser;
