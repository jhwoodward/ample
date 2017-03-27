var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var VelocityParser = require('../../src/interpreter/parsers/VelocityParser');
var State = require('../../src/interpreter/State');


  describe('VelocityParser', function() {
    it('should parse', function() {
      var parser = new VelocityParser();
      var test = '120=V';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      expect(parser.parsed.value).toEqual(120);
    });
    it ('should mutate state', function() {
      var parser = new VelocityParser();
      var test = '120=V';
      parser.match(test);
      var state = new State().clone();
      expect(state.velocity).toEqual(90); //defult
      parser.mutateState(state);
      expect(state.velocity).toEqual(120);
    });
  });
