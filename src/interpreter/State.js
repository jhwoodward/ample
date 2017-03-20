var _ = require('lodash');
var eventType = require('./constants').eventType;

function State(init, master) {

  this.master = master;
  if (!init) {
    init = {
      phrase: {
        name: 'default',
        pitchbend: 8192,
        velocity: 90,
        controller: {},
        keyswitch: undefined,
        on: 0,
        off: -5,
        events: []
      },
      events: []
    };
  }

  var state = {
    modifiers: [],
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
      articulations: []
    },
    phrase: {},
    events: [],
    time: {
      tempo: 120,
      tick: 48, //start at beat 1 (also enables keyswitch events to kick in prior to first beat)
      step: 48
    }
  };

  _.merge(this, state, init);

}

State.prototype.clone = function () {
  var clone = _.cloneDeep(this);
  clone.events = [];
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
        }
        );
      }
      _.merge(this, s.state);

      s.applied = true;
    }
  }.bind(this));
}

module.exports = State;
