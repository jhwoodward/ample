var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var SustainParser = require('../../src/interpreter/parsers/SustainParser');
var State = require('../../src/interpreter/State');


  describe('SustainParser', function() {
    it('should parse', function() {
      var parser = new SustainParser();
      var test = '/';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      expect(parser.parsed).toExist();
    });
    
    it ('should increment tick on leave', function() {
      var parser = new SustainParser();
      var test = '/';
      parser.match(test);
      var state = new State().clone();
      var next = state.clone();
      parser.next(next);
      expect(next.time.tick).toEqual(state.time.tick + state.time.step);
    });
  });
