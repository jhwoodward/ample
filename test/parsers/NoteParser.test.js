var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var macroType = require('../../src/interpreter/constants').macroType;
var NoteParser = require('../../src/interpreter/parsers/NoteParser');
var State = require('../../src/interpreter/State');

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
    var state = new State().clone();
    expect(state.pitch.value).toNotExist();
    expect(state.pitch.octave).toEqual(5);//default
    expect(state.scale.length).toEqual(0);
    expect(state.key.flats.length).toEqual(0);
    expect(state.key.sharps.length).toEqual(0);
    expect(state.on.tick).toNotExist();
    expect(state.on.offset).toNotExist();
    parser.mutateState(state);
    expect(state.pitch.string).toEqual('D#5');
    expect(state.pitch.value).toEqual(63);
  });

  it('should generate event', function () {
    var prev = new State();
    var state = prev.clone();
    parser.mutateState(state);
    expect(state.pitch.string).toEqual('D#5');
    expect(state.pitch.value).toEqual(63);
    expect(state.events.length).toEqual(0);
    expect(state.on.tick).toNotExist();
    expect(state.on.offset).toNotExist();
    parser.enter(state, prev);
    expect(state.events.length).toEqual(1);
  });

  it('should set \'on\' state', function () {
    var prev = new State();
    var state = prev.clone();
    parser.mutateState(state);
    parser.enter(state, prev);
    expect(state.on.tick).toEqual(state.time.tick);
    expect(state.on.offset).toEqual(0);
  });

  it('should increment tick on leave', function () {
    var state = new State().clone();
    var next = state.clone();
    parser.leave(state, next);
    expect(next.time.tick).toEqual(state.time.tick + state.time.step);
  });


  describe('With articulation', function () {

    var parser, matched;
    var accent = {
      key: '>',
      type: macroType.articulation,
      value: '130=V',
      parsed: {
        velocity: 130
      }
    };

    beforeEach(function () {
      parser = new NoteParser([accent]);
      var test = '>E';
      matched = parser.match(test);
    })

    it('should parse', function () {
      expect(matched).toExist();
      expect(parser.parsed.articulations.length).toEqual(1);
      expect(parser.parsed.articulations[0].parsed).toEqual(accent.parsed);
    });

    it('should set note state velocity', function () {
      var prev = new State().clone();
      var state = prev.clone();
      parser.mutateState(state);
      expect(state.note.velocity).toEqual(130);
      parser.enter(state, prev);
      expect(state.events.length).toEqual(1);
      expect(state.events[0].type).toEqual(eventType.noteon);
      expect(state.events[0].velocity).toEqual(130);
    });

    it('velocity should revert to phrase value on next note', function () {
      var prev = new State().clone();
      var state = prev.clone();
      parser.mutateState(state);
      expect(state.note.velocity).toEqual(130);

      parser.enter(state, prev);
      var next = state.clone();

      parser.leave(state, next);
      matched = parser.match('F');
      parser.mutateState(next);
      expect(next.note.velocity).toNotExist(); //default
      parser.enter(next, next.clone());
      expect(next.events.length).toEqual(2);
      expect(next.events[0].type).toEqual(eventType.noteoff);
      expect(next.events[1].type).toEqual(eventType.noteon);
      expect(next.events[1].velocity).toEqual(90);

    });



  });

});
