var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var ChordParser = require('../../src/interpreter/parsers/ChordParser');
var State = require('../../src/interpreter/State');
var pitchUtils = require('../../src/interpreter/pitchUtils');

  describe('ChordParser', function() {
    it('should parse', function() {
      var parser = new ChordParser();

      var test = 'Cmaj';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      var expected = ['C', 'E', 'G'];
      parser.parsed.forEach(function (p) {
        var ps = pitchUtils.midiPitchToStringNoOctave(p);
        expect(expected.indexOf(ps[0]) > -1 || expected.indexOf(ps[1]) > -1).toExist('Expected to find ' + ps.join(' or ') + ' in ' + expected.join(', '));
      });

      var test = 'Bb6';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      var expected = ['Bb', 'D', 'F', 'G'];
      parser.parsed.forEach(function (p) {
        var ps = pitchUtils.midiPitchToStringNoOctave(p);
        expect(expected.indexOf(ps[0]) > -1 || expected.indexOf(ps[1]) > -1).toExist('Expected to find ' + ps.join(' or ') + ' in ' + expected.join(', '));
      });

      var test = 'Dmin';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      var expected = ['D', 'F', 'A'];
      parser.parsed.forEach(function (p) {
        var ps = pitchUtils.midiPitchToStringNoOctave(p);
        expect(expected.indexOf(ps[0]) > -1 || expected.indexOf(ps[1]) > -1).toExist('Expected to find ' + ps.join(' or ') + ' in ' + expected.join(', '));
      });


    });
    it ('should constrain pitch to chord', function() {
 
    });
  
  });
