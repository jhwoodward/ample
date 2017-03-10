var _ = require('lodash');
var event = require('./event');

function RestParser() {
  this.type = 'rest';
  this.test = /^\^/;
}
RestParser.prototype = {
  parse: function (s) {
    return {rest: true};
  },
  mutateState: function (state) {
    state.noteon = false;
    var off = state.note.off !== undefined ? state.note.off : state.phrase.off;
    state.events.push({
      tick: state.time.tick + off,
      type: event.noteoff,
      pitch: state.pitch.value
    });
  },
  after: function(state) {
    state.time.tick += state.time.step;
  }
}

module.exports = RestParser;