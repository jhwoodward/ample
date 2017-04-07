var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var MasterScaleParser = require('../../src/interpreter/parsers/MasterScaleParser');
var State = require('../../src/interpreter/State');
var pitchUtils = require('../../src/interpreter/pitchUtils');

  describe('MasterScaleParser', function() {

    function checkNotes(expected,actual) {
      actualFlattened = [];
      actual.forEach(function (p) {
        var ps = pitchUtils.midiPitchToStringNoOctave(p);
        actualFlattened = actualFlattened.concat(ps);
        expect(expected.indexOf(ps[0]) > -1 || expected.indexOf(ps[1]) > -1).toExist('Expected to find ' + ps.join(' or ') + ' in ' + expected.join(', '));
      });
      expected.forEach(function(p) {
        expect(actualFlattened.indexOf(p) > -1).toExist('Expected to find ' + p + ' in ' + actualFlattened.join(', '));
      });
    }

    it('should parse', function() {
      var parser = new MasterScaleParser();

      var test = 'Cmaj';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      var expected = ['C', 'E', 'G'];
      checkNotes(expected, parser.parsed.chordConstraint);
    

      var test = 'Bb6';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      var expected = ['Bb', 'D', 'F', 'G'];
      checkNotes(expected, parser.parsed.chordConstraint);

      var test = 'Dmin';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      var expected = ['D', 'F', 'A'];
      checkNotes(expected, parser.parsed.chordConstraint);
     

      var test = 'Fm7';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      var expected = ['F', 'Ab', 'C', 'Eb'];
      checkNotes(expected, parser.parsed.chordConstraint);
     

    });

  
  });
