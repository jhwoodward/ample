var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var modifierType = require('../../src/interpreter/constants').modifierType;
var ScaleParser = require('../../src/interpreter/parsers/ScaleParser');
var State = require('../../src/interpreter/State');
var Interpreter = require('../../src/interpreter/Interpreter');
var pitchUtils = require('../../src/interpreter/pitchUtils');

describe('ScaleParser', function () {
  it('should parse', function () {
    var parser = new ScaleParser();
    var test = 'S(CDE+FGAB)S';
    var found = parser.match(test);
    expect(found).toExist();
    expect(parser.string).toEqual(test);
    var expected = ['C', 'D', 'E', 'F#', 'Gb', 'G', 'A', 'B'];
    parser.parsed.forEach(function (p) {
      var ps = pitchUtils.midiPitchToStringNoOctave(p);
      expect(expected.indexOf(ps[0]) > -1 || expected.indexOf(ps[1]) > -1).toExist();
    });
  });

  it('should change scale to c lydian mode', function () {
    var parser = new ScaleParser();
    var test = 'S(CDE+FGAB)S';
    parser.match(test);
    var state = new State().clone();
    expect(state.pitch.constraint).toNotExist();
    parser.mutateState(state);
    var expected = ['C', 'D', 'E', 'F#', 'G', 'A', 'B'];
    expect(state.pitch.constraint).toExist();
    state.pitch.constraint.forEach(function (p) {
      var ps = pitchUtils.midiPitchToStringNoOctave(p);
      expect(expected.indexOf(ps[0]) > -1 || expected.indexOf(ps[1]) > -1).toExist(ps.join(', '));
    });
  });

  it('should add pitch modifier', function () {
    var parser = new ScaleParser();
    var test = 'S(CDE+FGAB)S';
    parser.match(test);
    var state = new State().clone();
    expect(state.modifiers).toEqual([]);
    parser.mutateState(state);
    expect(state.modifiers.length).toEqual(1);
    expect(state.modifiers[0].type).toEqual(modifierType.pitch);

  });

  it('should constrain notes to scale', function () {
    var test = `S(CEG)S cDEFGA`;
    var interpeter = new Interpreter();
    var result = interpeter.interpret(test);

    var notes = result.states.reduce(function (acc, item) {
      var note = item.pitch.string;
      if (item.pitch.value && acc.indexOf(note) === -1) {
        acc.push(note);
      }
      return acc;
    }, []);

    expect(notes.length).toEqual(3);

    expectedNotes = ['C5', 'E5', 'G5'];
    notes.forEach(n => {
      expect(expectedNotes.indexOf(n)).toBeGreaterThan(-1);
    });

  });

});
