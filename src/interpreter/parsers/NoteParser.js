var parserUtils = require('../parserUtils');
var pitchUtils = require('../pitchUtils');
var eventType = require('../constants').eventType;
var macroType = require('../constants').macroType;
var modifierType = require('../constants').modifierType;
var _ = require('lodash');
var parser = require('./_parser');
var pitchParser = require('./_pitchParser');

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

    if (this.parsed.articulations.length) {
      state.note.articulationInfo = this.parsed.articulations.map(a => a.key).join(', ');
      this.parsed.articulations.forEach(a => {
        _.merge(state.note, a.state);
      });

      state.note.events = this.parsed.articulations.reduce((acc, a) => {
        if (!a.events) return acc;
        a.events.forEach(ae => {
          acc.push(_.merge({}, ae));
        });
        return acc;
      }, []);

      state.note.events.forEach((e) => {
        e.articulation = state.note.articulationInfo;
        delete e.annotation;
      });

    } else {
      state.note.events = state.phrase.events.reduce((acc, e) => {
        var out = _.merge({}, e);
        out.articulation = state.phrase.name;
        delete out.annotation;
        acc.push(out);
        return acc;
      },[]);
    }




  },
  enter: function (state, prev) {

    //pitch depends on prev state so have to calculate this in enter
    this.adjustOctaveForPitchTransition(state, prev);
    state.pitch.raw = this.getPitch(state);

    state.pitch.value = state.pitch.raw;

    var modifiers = state.modifiers.filter(m => m.type === modifierType.pitch).map(m => { 
      m.fn(state);
      return `${m.id}: ${m.name} (${pitchUtils.midiPitchToString(state.pitch.raw)})`;
    }).join(', ');
   

    //parsed pitch values are required to correctly calculate pitch based on previous character
    state.pitch = _.merge(state.pitch, this.parsed.pitch);
    state.pitch.string = pitchUtils.midiPitchToString(state.pitch.value);

    var note = _.extend({}, state.phrase, state.note);

    //prev note off
    if (prev.on.tick) {
      var offOffset = state.note.off;
      var offAnnotation = offOffset !== undefined ? prev.note.name : prev.phrase.name
      //prevent positive offsets at the end of a phrase
      if (!offOffset || offOffset > 0 && (note.off <= 0)) {
        offOffset = -5;
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
    //prevent negative offsets at the beginning of a phrase - should only apply to phrase changes - not note phrases
    if (onOffset < 0 && (!prev.on.tick || prev.note.on >= 0)) {
   //   onOffset = 0;
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
      articulation: state.note.articulationInfo,
      offset: onOffset,
      modifiers
    });

    state.note.events.forEach(e => {
      if (e.keyswitch) {
        if (e.type === 'noteon') {
          e.tick = onTick - 2;
        } else if (e.type === 'noteoff') {
          e.tick = onTick - 1;
        }
      } else {
        e.tick = onTick - 1;
      }
      state.events.push(e);
    });

  },
  leave: function (state, next) {
    //reset note articulations
    next.note = {
      articulations: []
    };
    next.time.tick += next.time.step;
  }
}

NoteParser.prototype = _.extend({}, parser, pitchParser, prototype);
module.exports = NoteParser;