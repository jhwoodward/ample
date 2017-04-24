var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var MasterMarkerParser = require('../../src/interpreter/parsers/MasterMarkerParser');
var State = require('../../src/interpreter/State');
var Interpreter = require('../../src/interpreter/Interpreter');

  describe('MasterMarkerParser', function() {
    it('should parse', function() {
      var parser = new MasterMarkerParser();
      var test = '$A';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      expect(parser.parsed).toEqual('A');
    });
    it ('should mutate state', function() {
      var parser = new MasterMarkerParser();
      var test = '$beginning';
      parser.match(test);
      var state = new State();

      expect(state.marker).toNotExist(); //default
      var interpreter = new Interpreter();
      parser.mutateState(state, interpreter);
      expect(state.marker).toEqual('beginning');
    })
  });
