var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var DurationParser = require('../../src/interpreter/parsers/DurationParser');
var State = require('../../src/interpreter/State');


  describe('DurationParser', function() {
    it('should parse', function() {
      var parser = new DurationParser();
      var test = '48,';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual('48,');
      expect(parser.parsed.value).toEqual(48);
    });
    it ('should mutate state', function() {
      var parser = new DurationParser();
      var test = '24,';
      parser.match(test);
      var state = new State().clone();
      expect(state.time.step).toEqual(48);
      parser.mutateState(state);
      expect(state.time.step).toEqual(24);
    });
  });
