var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var KeyswitchParser = require('../../src/interpreter/parsers/KeyswitchParser');
var State = require('../../src/interpreter/State');


  describe('KeyswitchParser', function() {
    it('should parse', function() {
      var parser = new KeyswitchParser();
      var test = '[-2:+D]';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      expect(parser.parsed.string).toEqual('D#3');
      expect(parser.parsed.pitch).toEqual('39');
    });
    it ('should mutate state', function() {
      var parser = new KeyswitchParser();
      var test = '[-2:+D]';
      parser.match(test);
      var state = new State().clone();
      expect(state.phrase.keyswitch).toNotExist();
      parser.mutateState(state);
      expect(state.phrase.keyswitch.pitch).toEqual(39);

    });
    it ('should generate event', function() {
      var parser = new KeyswitchParser();
      var test = '[-2:+D]';
      parser.match(test);
      var state = new State().clone();
      expect(state.events.length).toEqual(0);
      parser.mutateState(state);
      expect(state.events.length).toEqual(1);
      expect(state.events[0].tick).toEqual(state.time.tick);
      expect(state.events[0].type).toEqual(eventType.noteon);
      expect(state.events[0].pitch.value).toEqual(39);
      expect(state.events[0].pitch.string).toEqual('D#3');
      expect(state.events[0].keyswitch).toExist();
    });
  });
