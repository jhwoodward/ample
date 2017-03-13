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
    state.on = {};
    state.off = { tick: state.time.tick, offset: 0 };
  },
  enter: function(state, prev) {
    if (prev.on.tick) {
      var offset = prev.note.off !== undefined ? prev.note.off : prev.phrase.off;
      if (offset > 0) offset = 0;
      state.events.push({
        tick: state.time.tick,
        type: eventType.noteoff,
        pitch: state.pitch,
        duration: state.time.tick - prev.on.tick,
        annotation: 'Rest',
        offset: offset
      });
    }

  },
  leave: function (state, next) {
    next.time.tick += next.time.step;
  }
}

RestParser.prototype = _.extend({}, parser, prototype);

module.exports = RestParser;