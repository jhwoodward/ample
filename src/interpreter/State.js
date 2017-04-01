var _ = require('lodash');
var eventType = require('./constants').eventType;
var stateUtils = require('./stateUtils');

function State(defaultPhraseParser) {

  var state = {
    modifiers: [],
    key: {
      flats: [],
      sharps: []
    },
    pitch: {
      octave: 5,
      relativeStep: 1,
      transpose: 0
      //constraint: [] = array of pitch values
    },
    on: {},
    off: {},
    phrase: defaultPhraseParser || stateUtils.getDefaultPhraseParser(), //instance of AnnotationParser
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

  var next = _.cloneDeep(state);
  next.phrase.mutateState(next);
  _.merge(this, next);
}

State.prototype.clone = function () {
  var clone = _.cloneDeep(this);
  clone.mutater = undefined;
  clone.articulations = [];
  delete clone.animation;
  delete clone.marker;
  return clone;
}

State.prototype.mutate = function (parser, interpreter) {

  if (interpreter) {
    interpreter.master.states.forEach(function (s) {
      if (s.tick <= this.time.tick && !s.applied) {
        _.merge(this, s.state);
        s.applied = true;
      }
    }.bind(this));
  }

  this.parser = parser;
  parser.mutateState(this, interpreter);
  this.mutater = parser.type + ' (' + parser.string + ')';
}

module.exports = State;
