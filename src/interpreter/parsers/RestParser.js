var _ = require('lodash');
var eventType = require('../constants').eventType;
var parser = require('./_parser');

function RestParser() {
  this.type = 'Rest';
  this.test = /^\^/;
}
var prototype = {
  parse: function (s) {
    return true;
  },
  mutateState: function (state) {
    delete state.on.tick;
    state.off.tick = state.time.tick;
    state.phrase.mutateState(state);
  },
  getEvents: function (state, prev) {
    var events = [];
    if (prev.on.tick) {
      var offset = state.off.offset;
      if (offset > 0) offset = 0;
      var offTick = state.time.tick + offset;
      events.push({
        tick: offTick,
        type: eventType.noteoff,
        pitch: prev.pitch,
        duration: offTick - prev.on.tick,
        annotation: 'Rest (' + state.phrase.parsed.key + ')',
        offset: offset
      });

    }
    events = events.concat(state.phrase.getEvents(state, prev));
    return events;

  },
  next: function (next) {
    next.time.tick += next.time.step;
  }
}

RestParser.prototype = _.extend({}, parser, prototype);

module.exports = RestParser;