var pitchUtils = require('../pitchUtils');
var eventType = require('../constants').eventType;
var _ = require('lodash');
var parser = require('./_parser');
var pitchParser = require('./_pitchParser');

function RelativeNoteParser() {
  this.type = 'RelativeNote';
  this.test = /^[>'~_]?\!?\+*\-*[x-zX-Z]/;
}
var prototype = {
  parse: function (s) {
    var out = {
      pitch: parsePitch(s),
      articulations: parseArtic(s)
    };
    return strip(out);
  },
  mutateState: function (state) {
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
    state.pitch.raw += this.parsed.accidental * state.pitch.relativeStep;

    if (state.pitch.scale && state.pitch.scale.length) {
      state.pitch.value = pitchUtils.fitToScale(state);
    } else {
      state.pitch.value = state.pitch.raw;
    }

    state.pitch.string = ''; //TODO: work out note name from midi pitch

    state.trigger = event.noteon;
    state.events.push({
      type: eventType.noteon,
      pitch: state.pitch,
      velocity: state.note.velocity,
      info: '${state.pitch.string}  (${state.note.articulationInfo})'  
    });

  },
  leave: function (state, next) {
    next.time.tick += next.time.step;
  }
}

RelativeNoteParser.prototype = _.extend({}, parser, pitchParser, prototype);
module.exports = RelativeNoteParser;