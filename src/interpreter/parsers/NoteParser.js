var parserUtils = require('./parserUtils');
var pitchUtils = require('./pitchUtils');
var event = require('./event');
var _ = require('lodash');

function NoteParser() {
  this.type = 'note';
  this.test = /^[>'~_]?\!*\+?\-?\=?[a-gA-G]/;
}

NoteParser.prototype = {
  getPitch: pitchUtils.getPitch,
  setOctave: pitchUtils.setOctave,
  parse: function (s) {
    var out = {
      pitch: parserUtils.strip(parserUtils.parseNote(s)),
      articulations: parserUtils.parseArtic(s)
    };

    return out;
  },
  mutateState: function (state, annotations) {
    state.noteon = true;
    state.note = {};

    var articulationInfo = [];
    for (var key in annotations) {
      if (this.parsed.articulations.indexOf(key) > -1) {
        _.merge(state.note, annotations[key]);
        articulationInfo.push(key);
      }
    }
    if (articulationInfo.length) {
      state.note.articulationInfo = articulationInfo.join(' - ');
    }

    this.setOctave(state);
    var pitch = this.getPitch(state);
    if (state.scale && state.scale.length) {
      state.pitch.value = pitchUtils.fitToScale(pitch, state.scale);
    } else {
      state.pitch.value = pitch;
    }
    state.pitch = _.merge(state.pitch,this.parsed.pitch);
    state.pitch.string += state.pitch.octave;

    var info = state.pitch.string;
    if (state.note.articulationInfo) {
      info += ` (${state.note.articulationInfo})`
    }

    var on = state.note.on !== undefined ? state.note.on : state.phrase.on;
    var tick = state.time.tick + on;

    state.events.push({
      tick,
      type: event.noteon,
      pitch: state.pitch.value,
      velocity: state.note.velocity || state.phrase.velocity,
      info: info
    });

    if (state.note.pitchbend !== undefined) {
      state.events.push({
        tick: tick-1,
        type: event.pitchbend,
        value: state.note.pitchbend,
        info: state.note.articulationInfo
      });
    }

    if (state.note.controller) {
      for (var key in state.note.controller) {
        state.events.push({
          tick: tick-1,
          type: event.controller,
          controller: key,
          value: state.note.controller[key],
          info: state.note.articulationInfo
        });
      }
    }

    if (state.note.keyswitch) {
      state.events.push({
        tick: tick-1,
        type: event.keyswitch,
        pitch: this.parsed.pitch.value,
        info: state.note.articulationInfo
      });
    }

  },
  before: function(prev, state) {
    if (prev.noteon) {
      var off = prev.note.off !== undefined ? prev.phrase.off : prev.phrase.off;
      var info = prev.note.off !== undefined ? prev.phrase.name : prev.phrase.name;
      state.events.push({
        tick: state.time.tick + off,
        type: 'noteoff',
        pitch: prev.pitch.value,
        info
      });
    }

    var on = state.note.on !== undefined ? state.note.on : state.phrase.on;
    if (prev.note.pitchbend !== undefined && state.note.pitchbend === undefined) {
      state.events.push({
        tick: state.time.tick + on - 1,
        type: event.pitchbend,
        value: state.phrase.pitchbend,
        info: state.phrase.name
      });
    }

    if (prev.note.controller) {
      for (var key in prev.note.controller) {
        if (!state.note.controller || !state.note.controller[key]) {
          state.events.push({
            tick: state.time.tick + on - 1,
            type: event.controller,
            controller: key,
            value: state.phrase.controller[key] || 0,
            info: state.phrase.name
          });
        }
      }
    }

  },
  after: function(next) {
     next.time.tick += next.time.step;
  }
}

module.exports = NoteParser;