var _ = require('lodash');
var parser = require('./_parser');
var parserUtils = require('../parserUtils');
var pitchUtils = require('../pitchUtils');
var key = require('./_key');
var modifierType = require('../constants').modifierType;
var utils = require('../utils');

function ChordParser() {
  this.type = 'Chord';
  this.test = /^[A-G](#|b)?(maj|min|6|7|9|maj7|m6|min6|m7|min7|sus2|sus4)/;
}


var prototype = {
  parse: function (s) {
    var parsed = {
      root: /^[A-G]/.exec(s)[0],
      accidental: /(#|b)/.exec(s) ? /(#|b)/.exec(s)[0]: undefined,
      type: /(maj|min|6|7|9|maj7|m6|min6|m7|min7|sus2|sus4)/.exec(s)[0]
    };
       //work off C and transpose accordingly
    var noteString;
    switch (parsed.type) {
      case 'maj':
        noteString = 'CEG';
        break;
      case 'min':
        noteString = 'C-EG';
        break;
      case '6':
        noteString = 'CEGA';
        break;
      case '7':
        noteString = 'CEG-B';
        break;
      case '9':
        noteString = 'CEG-BD';
        break;
      case 'maj7':
        noteString = 'CEGB';
        break;
      case 'm7':
      case 'min7':
        noteString = 'C-EG-B';
        break;
      case 'm6':
      case 'min6':
        noteString = 'C-EGA';
        break;
      case 'sus4':
        noteString = 'CFG';
        break;
      default:
        throw (new Error('Unsupported chord type: ' + parsed.type));
        break;
    }
    var notes = parserUtils.parseNotes(noteString);
    var constraint = pitchUtils.allPitches(notes);
    var C5 = 60;
    var accidental = parsed.accidental === '#' ? 1 : parsed.accidental === 'b' ? -1: 0;
    var rootPitch = pitchUtils.midiPitchFromNote(parsed.root, 5, accidental);
    var transpose = rootPitch - C5;
    if (transpose !== 0) {
      constraint = constraint.map(c => {return c + transpose;});
    }
    return constraint;
  },
  mutateState: function (state) {
    state.pitch.constraint = { name: this.string, values: this.parsed };

    var modifier = {
      id: this.type,
      name: this.string,
      type: modifierType.pitch,
      fn: function constrainPitch(state) {
        state.pitch.value = pitchUtils.constrain(state.pitch.value, state.pitch.constraint.values);
      }
    }; 

    utils.addModifier(state, modifier, !!this.parsed.length);
  }
}

ChordParser.prototype = _.extend({}, parser, prototype);
module.exports = ChordParser;