var _ = require('lodash');

function State(init) {
  init = _.merge({
    name: 'default',
    pitchbend: 8192,
    velocity: 90,
    controller: {},
    keyswitch: undefined,
    on: 0,
    off: -5
  }, init);
  
  var state = {
    events: [],
    on: {},
    key: {
      flats: [],
      sharps: []
    },
    scale: [],
    pitch: {
      octave: 5,
      relativeStep: 1,
      transpose: 0
    },
    note: {
      controller: {},
      articulations: []
    },
    phrase: init
    ,
    time: {
      beat: 0,
      tempo: 120,
      tick: 48, //start at beat 1 (also enables keyswitch events to kick in prior to first beat)
      step: 48
    }
  };

  _.extend(this, state);

}

State.prototype.clone = function () {
  var clone = _.merge({}, this);
  clone.events = [];
  return clone;
}

module.exports = State;
