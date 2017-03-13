var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var ScaleParser = require('../../src/interpreter/parsers/ScaleParser');
var State = require('../../src/interpreter/State');

describe('ScaleParser', function () {
  it('should parse', function () {
    var parser = new ScaleParser();
    var test = 'S(CDE+FGAB)S';
    var found = parser.match(test);
    expect(found).toExist();
    expect(parser.string).toEqual(test);
    expect(parser.parsed.length).toEqual(7);
    expect(parser.parsed.map(n => n.string)).toEqual(['C', 'D', 'E', 'F#', 'G', 'A', 'B']);
  });

  it('should change scale to c lydian mode', function () {
    var parser = new ScaleParser();
    var test = 'S(CDE+FGAB)S';
    parser.match(test);
    var state = new State().clone();
    expect(state.scale).toEqual([]);
    parser.mutateState(state);
    expect(state.scale.length).toEqual(7);
    expect(state.scale.map(n => n.char)).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    expect(state.scale.map(n => n.accidental)).toEqual([0, 0, 0, 1, 0, 0, 0]);
  });

});
