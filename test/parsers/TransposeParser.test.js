var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var TransposeParser = require('../../src/interpreter/parsers/TransposeParser');
var State = require('../../src/interpreter/State');


  describe('TransposeParser', function() {
    it('should parse', function() {
      var parser = new TransposeParser();
      var test = '3@';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      expect(parser.parsed.value).toEqual(3);
    });
    it ('should mutate state', function() {
      var parser = new TransposeParser();
      var test = '3@';
      parser.match(test);
      var state = new State().clone();
      expect(state.pitch.transpose).toEqual(0); //defult
      parser.mutateState(state);
      expect(state.pitch.transpose).toEqual(3);
    });
  });
