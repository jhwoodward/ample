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

 // delete state.on; //prevents further noteoffs

  var out = [];
  var ornaments = {
    up: [4, 7, 4, 0],
    down: [-5, -8, -5, 0]
  };
  var notes = ornaments[config.direction];
  var pitches = notes.map(n => {
    var pitch = _.clone(state.pitch);
    pitch.value += n;
    return pitch;
  });

  var noteCount = Math.floor(state.parser.duration / config.duration);
  var onTick;
  var pitchIndex = 0;
  var count;
  for (count = 1; count <= noteCount; count++) {
    var onTick = state.time.tick + (config.duration * count);

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
      velocity: state.velocity - (count * 20),
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

function ArpeggioOrnamentParser() {
  this.type = 'ArpeggioOrnament';
  this.test = /^arpeggio (\d*) (up|down)?/;
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
      duration: parserUtils.parseValue(s).value || 24,
      direction
    };
  },
  mutateState: function (state, interpreter) {
    var modifier = {
      id: this.type,
      type: 'arpeggio',
      order: 130,
      appendEvents: function (state, events) {
        return appendEvents(state, events, this.parsed, interpreter);
      }.bind(this)
    }
    utils.addModifier(state, modifier);

  }

};


ArpeggioOrnamentParser.prototype = _.extend({}, parser, prototype);
module.exports = ArpeggioOrnamentParser;