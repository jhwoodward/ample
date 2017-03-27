var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var OnParser = require('../../src/interpreter/parsers/OnParser');
var State = require('../../src/interpreter/State');


  describe('OnParser', function() {
    it('should parse', function() {
      var parser = new OnParser();
      var test = '-5=ON';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      expect(parser.parsed.value).toEqual(-5);
    });
    it ('should mutate state', function() {
      var parser = new OnParser();
      var test = '-5=ON';
      parser.match(test);
      var state = new State();
     
      expect(state.on.offset).toEqual(0);
      parser.mutateState(state);
      expect(state.on.offset).toEqual(-5);
    });
  });
