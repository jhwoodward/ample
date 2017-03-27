var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var macroType = require('../../src/interpreter/constants').macroType;
var NoteParser = require('../../src/interpreter/parsers/NoteParser');
var State = require('../../src/interpreter/State');
var Interpreter = require('../../src/interpreter/Interpreter');

describe('NoteParser', function () {

  var parser, matched;
  beforeEach(function () {
    parser = new NoteParser();
    var test = '+D';
    matched = parser.match(test);
  })

  it('should parse', function () {
    expect(matched).toExist();
    expect(parser.parsed.articulations.length).toEqual(0);
    expect(parser.parsed.pitch.sharp).toExist();
    expect(parser.parsed.pitch.flat).toNotExist();
    expect(parser.parsed.pitch.accidental).toEqual(1);
    expect(parser.parsed.pitch.char).toEqual('D');
    expect(parser.parsed.pitch.up).toExist();
    expect(parser.parsed.pitch.down).toNotExist();
  });

  it('should set state pitch', function () {
    var prev = new State().clone();
    var state = prev.clone();
    expect(state.pitch.value).toNotExist();
    expect(state.pitch.octave).toEqual(5);//default
    expect(state.pitch.constraint).toNotExist();
    expect(state.key.flats.length).toEqual(0);
    expect(state.key.sharps.length).toEqual(0);
    parser.mutateState(state);
    expect(state.pitch.string).toEqual('Eb5');
    expect(state.pitch.value).toEqual(63);
  });

  it('should generate event', function () {
    var prev = new State().clone();
    var state = prev.clone();
    parser.mutateState(state);
    var events = parser.getEvents(state, prev);
    expect(events.length).toEqual(1);
  });

  it('should set \'on\' state', function () {
    var prev = new State().clone();
    var state = prev.clone();
    expect(state.on.tick).toNotExist();
    expect(state.on.offset).toNotExist();
    parser.mutateState(state);
    expect(state.on.tick).toEqual(state.time.tick);
    expect(state.on.offset).toEqual(0);

  });

  it('should generate noteoff event', function () {
    var noteParser = new NoteParser();
    noteParser.match('C');
    var prev = new State();
    noteParser.mutateState(prev);
    var next = prev.clone();
    noteParser.next(next);
    parser.mutateState(next);
    var events = parser.getEvents(next, prev);
    expect(events.length).toEqual(2);
    expect(events[0].type).toEqual(eventType.noteoff);
    expect(events[0].annotation).toEqual('default');
    expect(events[0].offset).toEqual(-5); //default detach
    expect(events[0].pitch.value).toEqual(60);
    expect(events[0].duration).toEqual(48 - 5);
  });

  it('should increment tick on leave', function () {
    var state = new State().clone();
    var next = state.clone();
    parser.next(next);
    expect(next.time.tick).toEqual(state.time.tick + state.time.step);
  });

});
