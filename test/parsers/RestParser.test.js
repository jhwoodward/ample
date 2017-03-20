var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var NoteParser = require('../../src/interpreter/parsers/NoteParser');
var RestParser = require('../../src/interpreter/parsers/RestParser');
var State = require('../../src/interpreter/State');


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
      state.on = { tick: 24, offset: 5};
      parser.mutateState(state);
      expect(state.on.tick).toNotExist();
      expect(state.off.tick).toEqual(state.time.tick);
    });

    it ('should generate noteoff event', function() {
      var noteParser = new NoteParser();
      noteParser.match('C');
      var prev = new State().clone();
      noteParser.mutateState(prev);
      noteParser.enter(prev, new State().clone())
      var state = prev.clone();
      noteParser.leave(prev, state);
      parser.mutateState(state);
      parser.enter(state, prev);
      expect(state.events.length).toEqual(1);
      expect(state.events[0].type).toEqual(eventType.noteoff);
      expect(state.events[0].annotation).toEqual('Rest (default)');
      expect(state.events[0].offset).toEqual(-5); //default detach
      expect(state.events[0].pitch.value).toEqual(60);
      expect(state.events[0].duration).toEqual(48 - 5);
    })

    it ('should increment tick on leave', function() {
      var state = new State().clone();
      var next = state.clone();
      parser.leave(state, next);
      expect(next.time.tick).toEqual(state.time.tick + state.time.step);
    });

    it('should revert expression to state.phrase', function() {
      throw(new Error('not implemented'));
    });
  });
