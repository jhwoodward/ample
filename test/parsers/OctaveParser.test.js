var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var OctaveParser = require('../../src/interpreter/parsers/OctaveParser');
var State = require('../../src/interpreter/State');


  describe('OctaveParser', function() {
    it('should parse', function() {
      var parser = new OctaveParser();
      var test = '2:';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      expect(parser.parsed.octave).toEqual(7);
    });
    it ('should mutate state', function() {
      var parser = new OctaveParser();
      var test = '2:';
      parser.match(test);
      var state = new State().clone();
      expect(state.pitch.octave).toEqual(5);
      parser.mutateState(state);
      expect(state.pitch.octave).toEqual(7);
    });
  });
