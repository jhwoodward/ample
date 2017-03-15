var expect = require('expect');
var pitchUtils = require('../src/interpreter/pitchUtils');


describe('pitchUtils.midiPitchToString()', function () {
  it('should return note string from midi pitch', function () {

    var testCasesFlats = [
      { test: 0, expected: 'C0' },
      { test: 25, expected: 'Db2' },
      { test: 92, expected: 'Ab7' },
      { test: 127, expected: 'G10' },
    ];

    var testCasesSharps = [
      { test: 6, expected: 'F#0' },
      { test: 75, expected: 'D#6' },
      { test: 92, expected: 'G#7' },
      { test: 58, expected: 'A#4' },
    ];

    testCasesFlats.forEach(t => {
      var actual = pitchUtils.midiPitchToString(t.test);
      expect(actual).toEqual(t.expected);
    });
    testCasesSharps.forEach(t => {
      var actual = pitchUtils.midiPitchToString(t.test, true);
      expect(actual).toEqual(t.expected);
    });

  });

});
