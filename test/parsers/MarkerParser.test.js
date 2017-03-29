var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var MarkerParser = require('../../src/interpreter/parsers/MarkerParser');
var State = require('../../src/interpreter/State');
var Interpreter = require('../../src/interpreter/Interpreter');

  describe('MarkerParser', function() {
    it('should parse', function() {
      var parser = new MarkerParser();
      var test = '$A';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      expect(parser.parsed).toEqual('A');
    });
    it ('should mutate state', function() {
      var parser = new MarkerParser();
      var test = '$beginning';
      parser.match(test);
      var state = new State();

      expect(state.marker).toNotExist(); //default
      var interpreter = new Interpreter();
      interpreter.isMaster = true;
      parser.mutateState(state, interpreter);
      expect(state.marker).toEqual('beginning');
    })
  });
