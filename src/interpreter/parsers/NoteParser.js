var parserUtils = require('../parserUtils');
var pitchUtils = require('../pitchUtils');
var eventType = require('../constants').eventType;
var macroType = require('../constants').macroType;
var _ = require('lodash');
var parser = require('./_parser');
var pitchParser = require('./_pitchParser');

function NoteParser(macros) {
  if (macros) {
    this.articulations = macros.reduce(function (acc, item) {
      if (item.type === macroType.articulation) { 
        acc[item.key] = item.parsed; 
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

    state.note.articulations = this.parsed.articulations.map(a => a.key);
    this.parsed.articulations.forEach(a => {
      _.merge(state.note, a.parsed);
    });

    this.setOctave(state);
    var pitch = this.getPitch(state);
    if (state.scale && state.scale.length) {
      state.pitch.value = pitchUtils.fitToScale(pitch, state.scale);
    } else {
      state.pitch.value = pitch;
    }
    state.pitch = _.merge(state.pitch, this.parsed.pitch);
    state.pitch.string += state.pitch.octave;

  },
  enter: function (state, prev) {

    var note = _.extend({}, state.phrase, state.note);
    var prevNote = _.extend({}, prev.phrase, prev.note);

    //prev note off
    if (prev.on.tick) {
      var offOffset = prevNote.off;
      var offAnnotation = prev.note.off !== undefined ? prev.note.name : prev.phrase.name
      //prevent positive offsets at the end of a phrase
      if (offOffset > 0 && (note.off <= 0)) {
        offOffset = 0;
        offAnnotation = state.phrase.name;
      }
      var offTick = state.time.tick + offOffset;
      state.events.push({
        tick: offTick,
        type: eventType.noteoff,
        pitch: prev.pitch,
        duration: offTick - prev.on.tick,
        annotation: offAnnotation,
        offset: offOffset
      });
    }

    var onOffset = note.on;
    //prevent negative offsets at the beginning of a phrase
    if (onOffset < 0 && (!prev.on.tick || prev.on.offset >= 0)) {
      onOffset = 0;
    }
    var onTick = state.time.tick + onOffset;

    //noteon event
    state.on = { tick: onTick, offset: onOffset };
    state.events.push({
      tick: onTick,
      type: eventType.noteon,
      pitch: state.pitch,
      velocity: note.velocity,
      annotation: state.phrase.name,
      articulation: state.note.articulations.join(', '),
      offset: onOffset
    });

    if (state.note.pitchbend !== undefined) {
      state.events.push({
        tick: onTick - 1,
        type: eventType.pitchbend,
        value: state.note.pitchbend,
        info: state.note.articulationInfo
      });
    }

    if (state.note.controller) {
      for (var key in state.note.controller) {
        state.events.push({
          tick: onTick - 1,
          type: eventType.controller,
          controller: key,
          value: state.note.controller[key],
          info: state.note.articulationInfo
        });
      }
    }

    if (state.note.keyswitch) {
      state.events.push({
        tick: onTick - 1,
        type: eventType.keyswitch,
        pitch: this.parsed.pitch,
        info: state.note.articulationInfo
      });
    }

    //reset articulations to phrase
    if (prev.note.pitchbend !== undefined && state.note.pitchbend === undefined) {
      state.events.push({
        tick: onTick - 1,
        type: eventType.pitchbend,
        value: state.phrase.pitchbend,
        info: state.phrase.name
      });
    }

    if (prev.note.controller) {
      for (var key in prev.note.controller) {
        if (!state.note.controller || !state.note.controller[key]) {
          state.events.push({
            tick: onTick - 1,
            type: eventType.controller,
            controller: key,
            value: state.phrase.controller[key] || 0,
            info: state.phrase.name
          });
        }
      }
    }

  },
  leave: function (state, next) {
    //reset note articulations
    next.note = {};
    next.time.tick += next.time.step;
  }
}

NoteParser.prototype = _.extend({}, parser, pitchParser, prototype);
module.exports = NoteParser;