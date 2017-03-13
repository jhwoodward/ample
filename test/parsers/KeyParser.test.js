var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var KeyParser = require('../../src/interpreter/parsers/KeyParser');
var State = require('../../src/interpreter/State');


  describe('KeyParser', function() {
    it('should parse', function() {
      var parser = new KeyParser();
      var test = 'K(-B-E-A)K';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      expect(parser.parsed.length).toEqual(3);
      expect(parser.parsed.map(n => n.string)).toEqual(['Bb','Eb','Ab']);
    });
    it ('should change key to E flat', function() {
      var parser = new KeyParser();
      var test = 'K(-B-E-A)K';
      parser.match(test);
      var state = new State().clone();
      expect(state.key).toEqual({
        flats: [],
        sharps: []
      });
      parser.mutateState(state);
      expect(state.key.flats.length).toEqual(3);
      expect(state.key.flats.map(n => n.char)).toEqual(['B','E','A']);
      expect(state.key.sharps.length).toEqual(0);
    });
    it ('should change key to D sharp', function() {
      var parser = new KeyParser();
      var test = 'K(+F+C)K';
      parser.match(test);
      var state = new State().clone();
      expect(state.key).toEqual({
        flats: [],
        sharps: []
      });
      parser.mutateState(state);
      expect(state.key.flats.length).toEqual(0);
      expect(state.key.sharps.length).toEqual(2);
      expect(state.key.sharps.map(n => n.char)).toEqual(['F','C']);
    
    });
  });
