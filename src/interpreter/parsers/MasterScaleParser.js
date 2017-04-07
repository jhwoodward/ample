var _ = require('lodash');
var parser = require('./_parser');
var parserUtils = require('../parserUtils');
var pitchUtils = require('../pitchUtils');
var key = require('./_key');
var modifierType = require('../constants').modifierType;
var utils = require('../utils');

function MasterScaleParser() {
  this.type = 'MasterScale';
  this.test = /^[A-G](#|b)?(6|7|9|mj7|m6|m7|dim7|maj|min|sus2|sus4)/;
}

var prototype = {
  parse: function (s) {
    var parsed = {
      root: /^[A-G]/.exec(s)[0],
      accidental: /(#|b)/.exec(s) ? /(#|b)/.exec(s)[0] : undefined,
      type: /(6|7|9|mj7|m6|m7|dim7|maj|min|sus2|sus4)/.exec(s)[0]
    };
    //work off C and transpose accordingly
    var chordString;
    switch (parsed.type) {
      case 'maj':
        chordString = 'CEG';
        scaleString = 'CDEFGAB';
        break;
      case 'min':
        chordString = 'C-EG';
        scaleString = 'CD-EFG-AB';// harmonic minor
        break;
      case '6':
        chordString = 'CEGA';
        scaleString = 'CDEFGAB';
        break;
      case '7':
        chordString = 'CEG-B';
        scaleString = 'CDEFGA-B';
        break;
      case '9':
        chordString = 'CEG-BD';
        scaleString = 'CDEFGA-B';
        break;
      case 'mj7':
        chordString = 'CEGB';
        scaleString = 'CDEFGAB';
        break;
      case 'm7':
        chordString = 'C-EG-B';
        scaleString = 'CD-EFG-A-B'; // melodic minor
        break;
      case 'm6':
        chordString = 'C-EGA';
        scaleString = 'CD-EFGA-B'; 
        break;
      case 'dim7':
        chordString = 'C-E-GA';
        scaleString = 'C-E-GA';
        break;
      case 'sus4':
        chordString = 'CFG';
        scaleString = 'CDEFGAB';
        break;
      default:
        throw (new Error('Unsupported chord type: ' + parsed.type));
        break;
    }

    var name = this.string;

    var scale = parserUtils.parseNotes(scaleString);
    var scaleConstraint = pitchUtils.allPitches(scale);

    var scalePitches = [];//each element of array contains pitches for all octaves for that note of the scale
    scale.forEach((note,i) => {
      scalePitches[i+1] = pitchUtils.allPitches([note]);
    });

    var chord = parserUtils.parseNotes(chordString);
    var chordConstraint = pitchUtils.allPitches(chord);
    var C5 = 60;
    var accidental = parsed.accidental === '#' ? 1 : parsed.accidental === 'b' ? -1 : 0;
    var rootPitch = pitchUtils.midiPitchFromNote(parsed.root, 5, accidental);
    var transpose = rootPitch - C5;
    if (transpose !== 0) {
      chordConstraint = chordConstraint.map(c => { return c + transpose; });
      scaleConstraint = scaleConstraint.map(c => { return c + transpose; });
      scalePitches.forEach((pitches,i) => {
        scalePitches[i] = pitches.map(c => { return c + transpose; });
      });
    }
    return {
      name,
      chordConstraint,
      scaleConstraint,
      scalePitches
    }
  },
  mutateState: function (state, interpreter) {
    if (interpreter.isMaster) {
      state.scale = this.parsed;
    }
  }
}

MasterScaleParser.prototype = _.extend({}, parser, prototype);
module.exports = MasterScaleParser;