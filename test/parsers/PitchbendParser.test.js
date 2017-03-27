var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var PitchbendParser = require('../../src/interpreter/parsers/PitchbendParser');
var State = require('../../src/interpreter/State');


  describe('PitchbendParser', function() {
    it('should parse', function() {
      var parser = new PitchbendParser();
      var test = '0=P';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      expect(parser.parsed.value).toEqual(0);
    });
    it ('should mutate state', function() {
      var parser = new PitchbendParser();
      var test = '0=P';
      parser.match(test);
      var state = new State().clone();
      expect(state.pitchbend).toEqual(8192); //defult
      parser.mutateState(state);
      expect(state.pitchbend).toEqual(0);
    });
  });
