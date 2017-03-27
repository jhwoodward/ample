var parserUtils = require('../parserUtils');
var pitchUtils = require('../pitchUtils');
var eventType = require('../constants').eventType;
var macroType = require('../constants').macroType;
var modifierType = require('../constants').modifierType;
var _ = require('lodash');
var parser = require('./_parser');
var noteParser = require('./_noteParser');

function NoteParser(macros) {
  if (macros) {
    this.articulations = macros.reduce(function (acc, item) {
      if (item.type === macroType.articulation) {
        acc[item.key] = item;
      }
      return acc;
    }, {});
  }

  this.type = 'Note';
  this.test = /^[>'~_]?\!*\+?\-?\=?[a-gA-G]/;
}

var prototype = {
  parse: function (s) {
    var out = {
      pitch: parserUtils.strip(parserUtils.parseNote(s)),
      articulations: this.parseArticulation(s)
    };

    return out;
  },
  mutateState: function (state) {
    var prev = _.cloneDeep(state);
    state.phrase.mutateState(state);

    this.parsed.articulations.forEach(a => {
      a.mutateState(state);
    });

    state.articulationInfo = this.parsed.articulations.map(a => a.key).join(', ');

    this.adjustOctaveForPitchTransition(state);
    state.pitch.raw = this.getPitch(state);
    state.pitch.value = state.pitch.raw;
    var modifiers = state.modifiers.filter(m => m.type === modifierType.pitch);
    modifiers.forEach(m => { 
      m.fn(state); 
    });
    state.modifierInfo = modifiers.map(m => {
      return `${m.id}: ${m.name} (${pitchUtils.midiPitchToString(state.pitch.raw)})`;
    }).join(', ')

    //parsed pitch values are required to correctly calculate pitch based on previous character
    state.pitch = _.merge(state.pitch, this.parsed.pitch);
    state.pitch.string = pitchUtils.midiPitchToString(state.pitch.value);

    var onOffset = state.on.offset;
    //prevent negative offsets at the beginning of a phrase - should only apply to phrase changes - not note phrases
  
    if (onOffset < 0 && (!prev.on.tick || prev.on.offset >= 0)) {
      //   onOffset = 0;
    }
    var isRepeatedNote = prev.pitch.value === state.pitch.value;
    if (isRepeatedNote) {
      onOffset = 0;
    }
    state.on = { tick: state.time.tick + onOffset, offset: onOffset };

  },
  getEvents: function (state, prev, events) {
    var out;
    
    //expression
    if (this.parsed.articulations.length) {
      this.parsed.articulations.forEach(a => {
        out = a.getEvents(state, prev, events);
      });
    } else {
      out = state.phrase.getEvents(state, prev, events);
    }
    out.forEach(e => {
      e.tick = state.time.tick + (state.on.offset || 0) + (e.offset || 0);
    });

    //prev note off
    if (prev.on.tick) {
      var offOffset = state.off.offset || 0;
      var offAnnotation = state.phrase.parsed.key;
      var isRepeatedNote = prev.pitch.value === state.pitch.value;
      //TODO: prevent positive offsets at the end of a phrase
      if (isRepeatedNote) {
        offOffset = -5;
      }
      
      if (isRepeatedNote) {
        offAnnotation += ' (repeat note)';
      }
      out.push({
        tick: state.time.tick + offOffset,
        type: eventType.noteoff,
        pitch: prev.pitch,
        duration: state.time.tick + offOffset - prev.on.tick,
        annotation: offAnnotation,
        offset: offOffset
      });
    }

    //noteon
    out.push({
      tick: state.time.tick + (state.on.offset || 0),
      offset: state.on.offset,
      type: eventType.noteon,
      pitch: state.pitch,
      velocity: state.velocity,
      annotation: state.phrase.parsed.key,
      articulation: state.articulationInfo,
      modifiers: state.modifierInfo
    });

    return out;
  },
  next:function (next) {
    next.time.tick += next.time.step;
  }
}

NoteParser.prototype = _.extend({}, parser, noteParser, prototype);
module.exports = NoteParser;