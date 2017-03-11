var _ = require('lodash');

function State(init) {

  var state = {
    key: {
      flats: [],
      sharps: []
    },
    scale: [],
    pitch: {
      octave: 4,
      relativeStep: 1,
      transpose: 0
    },
    note: {},
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

State.prototype.clone = function() {
  var clone = _.merge({}, this);
  clone.events = [];
  return clone;
}

module.exports = State;
