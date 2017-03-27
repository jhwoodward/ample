var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var OffParser = require('../../src/interpreter/parsers/OffParser');
var State = require('../../src/interpreter/State');


  describe('OffParser', function() {
    it('should parse', function() {
      var parser = new OffParser();
      var test = '7=OFF';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      expect(parser.parsed.value).toEqual(7);
    });
    it ('should mutate state', function() {
      var parser = new OffParser();
      var test = '7=OFF';
      parser.match(test);
      var state = new State();
      state.phrase.mutateState(state);
      expect(state.off.offset).toEqual(-5); //default
      parser.mutateState(state);
      expect(state.off.offset).toEqual(7);
    })
  });
