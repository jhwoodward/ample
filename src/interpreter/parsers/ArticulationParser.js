var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var eventType = require('../constants').eventType;

function ArticulationParser(annotation) {
  this.type = 'Articulation';
  this.parsed = annotation.parsed;
  this.key = annotation.key;
}

var prototype = {
  mutateState: function (state) {
    this.parsed.forEach(parser => {
      parser.mutateState(state);
    });
  },
  getEvents: function(state, prev) {
    return this.parsed.reduce(function(acc, parser) {
      if (!parser.getEvents) return acc;
      acc = acc.concat(parser.getEvents(state, prev));
      return acc;
    },[]);
  }
}

ArticulationParser.prototype = prototype;
module.exports = ArticulationParser;