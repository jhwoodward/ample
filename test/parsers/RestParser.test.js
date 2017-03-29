var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var NoteParser = require('../../src/interpreter/parsers/NoteParser');
var RestParser = require('../../src/interpreter/parsers/RestParser');
var macroType = require('../../src/interpreter/constants').macroType;
var State = require('../../src/interpreter/State');
var parse = require('../../src/interpreter/parse');

  describe('RestParser', function() {

    var parser, matched, test = '^';
    beforeEach(function(){
      parser = new RestParser();
      matched = parser.match(test);
    });

    it('should parse', function() {
      expect(matched).toExist();
      expect(parser.string).toEqual(test);
      expect(parser.parsed).toExist();
    });
    
    it ('should mutate state', function() {
      var state = new State().clone();
      state.on = { tick: 24, offset: 5 };
      parser.mutateState(state);
      expect(state.on.tick).toNotExist();
      expect(state.off.tick).toEqual(state.time.tick);
    });

    it ('should generate noteoff event', function() {
      var noteParser = new NoteParser();
      noteParser.match('C');

      var prev = new State();
      noteParser.mutateState(prev);
      var next = prev.clone();
      noteParser.next(next);
      parser.mutateState(next);
      var events = parser.getEvents(next, prev);
      expect(events.length).toEqual(2);
      expect(events[0].type).toEqual(eventType.controller);
      expect(events[1].type).toEqual(eventType.noteoff);
      expect(events[1].annotation).toEqual('Rest (default)');
      expect(events[1].offset).toEqual(-5); //default detach
      expect(events[1].pitch.value).toEqual(60);
      expect(events[1].duration).toEqual(48 - 5);
    });

    it ('should increment tick on leave', function() {
      var state = new State().clone();
      var next = state.clone();
      parser.next(next);
      expect(next.time.tick).toEqual(state.time.tick + state.time.step);
    });

    it('should revert state to phrase', function() {
      var accentScript = '130=V';
      var accent = {
        key: '>',
        type: macroType.articulation,
        value: accentScript,
        parsed: parse(accentScript)
      };
      accentedNoteParser = new NoteParser([accent]);
      accentedNoteParser.match('>E');
  
      var prev = new State();
      accentedNoteParser.mutateState(prev);
      expect(prev.velocity).toEqual(130);
      var next = prev.clone();
      accentedNoteParser.next(next);
      parser.mutateState(next);
      var events = parser.getEvents(prev, next);
      expect(next.velocity).toEqual(90);
    });
  });
