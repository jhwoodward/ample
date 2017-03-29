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
    state.articulations.push(this);
    this.parsed.forEach(parser => {
      parser.mutateState(state);
    });
  },
  getEvents: function(state, prev, events) {
    /*
    if (prev.articulations.filter(a=> a.key === this.key).length) {
      return [];
    }*/
    var out = this.parsed.reduce(function(acc, parser) {
      if (!parser.getEvents) return acc;
      acc = acc.concat(parser.getEvents(state, prev, events));
      return acc;
    },[]);
    out.forEach(e => {
      e.articulation = this.key;
    });
    return out;
  }
}

ArticulationParser.prototype = prototype;
module.exports = ArticulationParser;