var _ = require('lodash');
var eventType = require('./constants').eventType;

function State(defaultPhraseParser) {

  var state = {
    modifiers: [],
    key: {
      flats: [],
      sharps: []
    },
    scale: {
      name: '',
      chordConstraint: [],
      scaleConstraint: [],
      scalePitches: []
    },
    pitch: {
      octave: 5,
      relativeStep: 1,
      transpose: 0
    },
    on: {},
    off: {},
    onOffset: 0,
    offOffset: -5,
    controller: {},
    pitchbend: undefined,
    velocity: 85,
    keyswitch: undefined,
    articulations: [],
    animation: undefined,
    time: {
      tempo: 120,
      tick: 48, //start at beat 1 (also enables keyswitch events to kick in prior to first beat)
      step: 48
    }
  };

  _.merge(this, state);

  if (defaultPhraseParser) {
    this.mutate(defaultPhraseParser);
  }


}

State.prototype.clone = function () {
  var clone = _.cloneDeep(this);
  clone.mutater = undefined;
  clone.articulations = [];
  delete clone.articulation;
  delete clone.animation;
  delete clone.marker;
  clone.on = this.on; //retain ref to on for updates
  return clone;
}

State.prototype.mutate = function (parser, interpreter) {

  if (interpreter && interpreter.master) {
    interpreter.master.states.forEach(function (s) {
      if (s.tick === this.time.tick) {
        _.merge(this, s.state);
        // s.applied = true;
      }
    }.bind(this));
  }

  this.parser = parser;
  parser.mutateState(this, interpreter);
  this.mutater = parser.type + ' (' + parser.string + ')';
}

module.exports = State;
