var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var macroType = require('../../src/interpreter/constants').macroType;
var NoteParser = require('../../src/interpreter/parsers/NoteParser');
var State = require('../../src/interpreter/State');
var Interpreter = require('../../src/interpreter/Interpreter');

describe('NoteParser', function () {

  describe('With articulation', function () {

    var parser, matched;
    var accent = {
      key: '>',
      type: macroType.articulation,
      value: '130=V',
      state: {
        velocity: 130
      }
    };

    beforeEach(function () {
      parser = new NoteParser([accent]);
      var test = '>E';
      matched = parser.match(test);
    })

    it('should parse', function () {
      expect(matched).toExist();
      expect(parser.parsed.articulations.length).toEqual(1);
      expect(parser.parsed.articulations[0].parsed).toEqual(accent.parsed);
    });

    it('should set note state velocity', function () {
      var prev = new State().clone();
      var state = prev.clone();
      parser.mutateState(state);
      expect(state.note.velocity).toEqual(130);
      parser.enter(state, prev);
      expect(state.events.length).toEqual(1);
      expect(state.events[0].type).toEqual(eventType.noteon);
      expect(state.events[0].velocity).toEqual(130);
    });

    it('velocity should revert to phrase value on next note', function () {
      var prev = new State().clone();
      var state = prev.clone();
      parser.mutateState(state);
      expect(state.note.velocity).toEqual(130);

      parser.enter(state, prev);
      var next = state.clone();

      parser.leave(state, next);
      matched = parser.match('F');
      parser.mutateState(next);
      expect(next.note.velocity).toNotExist(); //default
      parser.enter(next, next.clone());
      expect(next.events.length).toEqual(2);
      expect(next.events[0].type).toEqual(eventType.noteoff);
      expect(next.events[1].type).toEqual(eventType.noteon);
      expect(next.events[1].velocity).toEqual(90);

    });

  });

});
