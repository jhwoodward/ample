var _ = require('lodash');

function State(defaultExpression) {

  defaultExpression = defaultExpression || {
    pitchbend: 8192,
    velocity: 90,
    controller: {},
    keyswitch: undefined,
    on: 0,
    off: -5
  };

  var state = {
    key: {
      flats: [],
      sharps: [],
      scale: []
    },
    expression: {
      note: {
        articulations: [],
        //  dynamics: defaultExpression.dynamics || 90,
        pitchbend: defaultExpression.pitchbend,
        velocity: defaultExpression.velocity,
        controller: defaultExpression.controller,
        keyswitch: undefined,
        on: 0, //adjust noteon time in ticks
        off: 0, //adjust noteoff time in ticks
      },
      phrase: {
        name: 'default',
        //  dynamics: defaultExpression.dynamics || 90,
        pitchbend: defaultExpression.pitchbend,
        velocity: defaultExpression.velocity,
        controller: defaultExpression.controller,
        keyswitch: undefined,
        on: 0, //adjust noteon time in ticks
        off: 0, //adjust noteoff time in ticks
      }
    },
    pitch: {
      char: '',
      raw: 0,
      value: 0,
      octave: 4,
      transpose: 0,
      accidental: 0,
      natural: false,
      relativeStep: 1
    },
    time: {
      beat: 0,
      tempo: 120,
      tick: 48, //start at beat 1 (also enables keyswitch events to kick in prior to first beat)
      step: 48
    }
  };

  _.extend(this, state);

}

module.exports = State;
