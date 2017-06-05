var _ = require('lodash');
var parser = require('./_parser');
var parserUtils = require('../parserUtils');
var pitchUtils = require('../pitchUtils');
var key = require('./_key');
var modifierType = require('../constants').modifierType;
var utils = require('../utils');
var eventType = require('../constants').eventType;


function appendEvents(state, events, config, interpreter) {

  var initialNoteOnTick = state.time.tick + (state.on.offset || 0);
  var noteon = events.filter(e => e.type === eventType.noteon)[0];
  noteon.duration = config.duration;
  //reset note off
  var noteoff = events.filter(e => e.type === eventType.noteoff)[0];
  noteoff.tick = state.time.tick + config.duration;
  noteoff.duration = config.duration;

  function getModifiers(state) {
    return state.modifiers.filter(m => m.type === modifierType.pitch).sort((a, b) => {
      return a.order > b.order ? 1 : -1;
    });
  }

  delete state.on.tick; //prevents further noteoffs

  var out = [];
  var ornaments = {
    up: [2, 0, -2, 0],
    down: [-2, 0, 2, 0]
  };
  var notes = ornaments[config.direction];
  var pitches = notes.map(n => {
    var pitch = _.clone(state.pitch);
    pitch.value += n;
    return pitch;
  });

  var noteCount = Math.floor(state.on.duration / config.duration);
  var onTick;
  var pitchIndex = 0;
  var count;
  for (count = 1; count <= noteCount; count++) {
    var onTick = state.time.tick + (config.duration * count);

    //TODO: not really necessary to recalculate for every tick. Every beat should be enough
    var dummyState = _.cloneDeep(interpreter.getStateAt(onTick));
    dummyState.pitch = _.clone(pitches[pitchIndex]);
    var modifiers = getModifiers(dummyState);
    modifiers.forEach(m => {
      m.fn(dummyState);
    });
    
    out.push({
      tick: onTick,
      offset: dummyState.on.offset,
      type: eventType.noteon,
      pitch: dummyState.pitch,
      velocity: state.velocity - (count * 5),
      duration: config.duration,
      ornament: true
    });
    out.push({
      tick: onTick + config.duration,
      offset: dummyState.off.offset,
      type: eventType.noteoff,
      pitch: dummyState.pitch,
      ornament: true
    });

    pitchIndex++;
    if (pitchIndex === pitches.length) {
      pitchIndex = 0;
    }
  }


  return out;
}

function TurnOrnamentParser() {
  this.type = 'TurnOrnament';
  this.test = /^turn (\d*) (up|down)?/;
  this.generatesEvents = true;
}

var prototype = {
  parse: function (s) {
    var direction = 'up';
    const directionTest = /(up|down)/.exec(s);
    if (directionTest) {
      direction = directionTest[0];
    }
    return {
      duration: parserUtils.parseValue(s).value,
      direction
    };
  },
  mutateState: function (state, interpreter) {
    var modifier = {
      id: this.type,
      type: 'Turn',
      order: 130,
      appendEvents: function (state, events) {
        return appendEvents(state, events, this.parsed, interpreter);
      }.bind(this)
    }
    utils.addModifier(state, modifier);

  }

};


TurnOrnamentParser.prototype = _.extend({}, parser, prototype);
module.exports = TurnOrnamentParser;