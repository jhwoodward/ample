var parserUtils = require('../parserUtils');
var pitchUtils = require('../pitchUtils');
var eventType = require('../constants').eventType;
var macroType = require('../constants').macroType;
var modifierType = require('../constants').modifierType;
var _ = require('lodash');
var parser = require('./_parser');
var noteParser = require('./_noteParser');
var AnnotationParser = require('./AnnotationParser');

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

    if (state.phrase) {
      state.articulation = state.phrase.merge(this.parsed.articulations);
      state.articulation.mutateState(state);

    }

    this.adjustOctaveForPitchTransition(state);
    state.pitch.raw = this.getPitch(state);
    state.pitch.value = state.pitch.raw;
    var modifiers = state.modifiers.filter(m => m.type === modifierType.pitch).sort((a, b) => {
      return a.order > b.order ? 1 : -1;
    });
    state.modifierInfo = [];
    var rawPitchString = pitchUtils.midiPitchToString(state.pitch.raw);
    modifiers.forEach(m => {
      var info = m.fn(state);
      state.modifierInfo.push(`${m.id}: ${info} (${rawPitchString})`);
    });

    //parsed pitch values are required to correctly calculate pitch based on previous character
    state.pitch = _.merge(state.pitch, this.parsed.pitch);
    // merge is not correctly passing on up / down due to undefined
    state.pitch.down = this.parsed.pitch.down;
    state.pitch.up = this.parsed.pitch.up;
    state.pitch.string = pitchUtils.midiPitchToString(state.pitch.value);
    /*
        var onOffset = state.on.offset || 0;
        //prevent negative offsets at the beginning of a phrase - should only apply to phrase changes - not note phrases
    
        if (onOffset < 0 && (!prev.on.tick || prev.on.offset >= 0)) {
          //   onOffset = 0;
        }
        var isRepeatedNote = prev.pitch.value === state.pitch.value;
        if (isRepeatedNote) {
          onOffset = 0;
        }
    
        //TODO: noteoff needs a bit of tidying up / refactoring
        var onTick = state.time.tick + onOffset;
        // if (prev.on.tick && !prev.on.duration) {
        //   prev.on.duration = prev.on.parser.duration = onTick - prev.on.tick + (state.off.offset || 0)
        // }
        */
    this.duration = state.time.step;
    state.on = this;

  },
  getEvents: function (state, prev) {
    var out = [];

    if (state.articulation) {
       out = state.articulation.getEvents(state, prev);
    }
   
    out.forEach(e => {
      e.tick = state.time.tick + (state.on.offset || 0) + (e.offset || 0);
    });

    //prev note off
    /*
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
        offset: offOffset,
        origin: this.origin,
        onOrigin: prev.on.origin
      });
    }
    */
    var isRepeatedNote = prev.pitch.value === state.pitch.value;

    var offOffset = state.off.offset || 0;
    //TODO: prevent positive offsets at the end of a phrase
    if (isRepeatedNote) {
      offOffset = -5;
    }
   // this.duration += offOffset;
    var offAnnotation = state.phrase ? state.phrase.parsed.key: '';

    if (isRepeatedNote) {
      offAnnotation += ' (repeat note)';
    }

    //noteon
    out.push({
      tick: state.time.tick + (state.on.offset || 0),
      offset: state.on.offset,
      type: eventType.noteon,
      pitch: state.pitch,
      velocity: state.velocity,
      annotation: offAnnotation,
      articulation: state.articulation.info,
      modifiers: state.modifierInfo.join(', '),
      origin: this.origin, //ref to string position
      duration: this.duration + offOffset,
    });


    //noteoff
    out.push({
      tick: state.time.tick + this.duration + offOffset,
      type: eventType.noteoff,
      pitch: state.pitch,
      duration: this.duration + offOffset,
      annotation: offAnnotation,
      offset: offOffset,
      onOrigin: this.origin
    });

    var modifiers = state.modifiers.filter(m => m.appendEvents).sort((a, b) => {
      return a.order > b.order ? 1 : -1;
    });

    var appended = [];
    modifiers.forEach(m => {
      //NB if out is mutated by modifier (eg remove note off)...
      appended = appended.concat(m.appendEvents(state, out));
    });

    return out.concat(appended);
  },
  next: function (next) {
    next.time.tick += next.time.step;
  }
}

NoteParser.prototype = _.extend({}, parser, noteParser, prototype);
module.exports = NoteParser;