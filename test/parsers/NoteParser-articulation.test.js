var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var macroType = require('../../src/interpreter/constants').macroType;
var NoteParser = require('../../src/interpreter/parsers/NoteParser');
var State = require('../../src/interpreter/State');
var Interpreter = require('../../src/interpreter/Interpreter');
var parse = require('../../src/interpreter/parse');

describe('NoteParser', function () {

  describe('With articulation', function () {

    var parser, matched;
    var accent = {
      key: '>',
      type: macroType.articulation,
      value: '130=V'
    };
    accent.parsed = parse(accent.value);

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
      expect(state.velocity).toEqual(130);
      var events = parser.getEvents(state, prev);
      expect(events.length).toEqual(1);
      expect(events[0].type).toEqual(eventType.noteon);
      expect(events[0].velocity).toEqual(130);
    });

    it('velocity should revert to phrase value on next note', function () {
      var prev = new State();
      var state = prev.clone();
      parser.mutateState(state);
      expect(state.velocity).toEqual(130);
      var next = state.clone();
      parser.next(next);
      matched = parser.match('F');
      parser.mutateState(next);
      var events = parser.getEvents(next, state);
      expect(events.length).toEqual(3); //includes a cc1 85 for default annotation
      expect(events[0].type).toEqual(eventType.controller);
      expect(events[1].type).toEqual(eventType.noteoff);
      expect(events[2].type).toEqual(eventType.noteon);
      expect(events[2].velocity).toEqual(90);
    });

  });

});
