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
      var offset = state.note.off || state.phrase.off;
      if (offset > 0) offset = 0;
      var offTick = state.time.tick + offset;
      state.events.push({
        tick: offTick,
        type: eventType.noteoff,
        pitch: prev.pitch,
        duration: offTick - prev.on.tick,
        annotation: 'Rest (' + state.phrase.name +')',
        offset: offset
      });

      var events = state.phrase.events.reduce((acc, e) => {
        var out = _.merge({}, e);
        out.annotation = state.phrase.name + ' (rest)';
        if (e.keyswitch) {
          if (e.type==='noteon') {
             out.tick = offTick -2;
          } else if (e.type==='noteoff') {
             out.tick = offTick -1;
          }
        } else {
          out.tick = offTick -1;
        }
        acc.push(out);
        return acc;
      },[]);

      state.events = state.events.concat(events);


    }

  },
  leave: function (state, next) {
    next.time.tick += next.time.step;
  }
}

RestParser.prototype = _.extend({}, parser, prototype);

module.exports = RestParser;