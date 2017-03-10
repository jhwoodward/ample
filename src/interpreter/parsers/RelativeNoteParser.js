var pitchUtils = require('./pitchUtils');
var event = require('./event');
var _ = require('lodash');

function RelativeNoteParser() {
  this.type = 'relativeNote';
  this.test = /^[>'~_]?\!?\+*\-*[x-zX-Z]/;
}
RelativeNoteParser.prototype = {
  getPitch: pitchUtils.getPitch,
  setOctave: pitchUtils.setOctave,
  fitToScale: pitchUtils.fitToScale,
  parse: function (s) {
    var out = {
      pitch: parsePitch(s),
      articulations: parseArtic(s)
    };
    return strip(out);
  },
  mutateState: function (state) {

    state.noteon = true;
    
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
      state.pitch.value = this.fitToScale(state);
    } else {
      state.pitch.value = state.pitch.raw;
    }

    state.pitch.string = ''; //TODO: work out note name from midi pitch

    state.trigger = event.noteon;
    state.events.push({
      type: event.noteon,
      pitch: state.pitch.value,
      velocity: state.note.velocity,
      info: '${state.pitch.string}  (${state.note.articulationInfo})'  
    });

  },
  after: function (state) {
    state.time.tick += state.time.step;
  }
}

module.exports = RelativeNoteParser;