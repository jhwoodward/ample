var _ = require('lodash');
var eventType = require('../constants').eventType;

function RestParser() {
  this.type = 'rest';
  this.test = /^\^/;
}
RestParser.prototype = {
  parse: function (s) {
    return {rest: true};
  },
  mutateState: function (state) {
    var offset = state.note.off !== undefined ? state.note.off : state.phrase.off;
    var offTick = state.time.tick + offset;
    var annotation = state.note.off !== undefined ? state.note.name : state.phrase.name;
    state.events.push({
      tick: offTick,
      type: eventType.noteoff,
      pitch: state.pitch,
      duration: offTick - state.note.onTick,
      annotation,
      offset
    });
    delete state.note.onTick;
  },
  after: function(state) {
    state.time.tick += state.time.step;
  }
}

module.exports = RestParser;