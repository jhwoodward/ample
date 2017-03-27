var _ = require('lodash');
var eventType = require('./constants').eventType;
var stateUtils = require('./stateUtils');

function State(defaultPhraseParser, master) {
  this.master = master;
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
    keyswitch: [],
    time: {
      tempo: 120,
      tick: 48, //start at beat 1 (also enables keyswitch events to kick in prior to first beat)
      step: 48
    }
  };

  var next = _.cloneDeep(state);
  next.phrase.mutateState(next);
  this.initEvents = next.phrase.getEvents(next, state);
  this.initEvents.forEach(e => {
    e.tick = 10 + (e.offset || 0);
  });
  _.merge(this, next);
}


State.prototype.clone = function () {
  var clone = _.cloneDeep(this);
  clone.mutater = undefined;
  return clone;
}

State.prototype.mutateFromMaster = function () {
  if (!this.master || !this.master.length) return;

  //extend this with any states where tick <= this.time.tick
  this.master.forEach(function (s) {
    if (s.tick <= this.time.tick && !s.applied) {

      if (s.state.time && this.time.tempo !== s.state.time.tempo) {
        this.events.push({
          tick: this.time.tick,
          type: eventType.tempo,
          value: s.state.time.tempo
        });
      }
      _.merge(this, s.state);

      s.applied = true;
    }
  }.bind(this));

}

module.exports = State;
