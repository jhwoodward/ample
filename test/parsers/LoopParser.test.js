var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var LoopParser = require('../../src/interpreter/parsers/LoopParser');
var State = require('../../src/interpreter/State');
var Interpreter = require('../../src/interpreter/Interpreter');

describe('LoopParser', function () {
  it('should parse', function () {
    var parser = new LoopParser();
    var test = '( 48,0:cDEFG )*3';
    var found = parser.match(test);
    expect(found).toExist();
    expect(parser.string).toEqual(test);
    expect(parser.parsed.count).toEqual(3);
    expect(parser.parsed.part).toEqual('48,0:cDEFG');
  });
  it('should mutate state', function () {
    var parser = new LoopParser();
    var test = '( 48,0:cDE )*3';
    parser.match(test);
    var interpreter = new Interpreter();
    interpreter.states = [new State()];

    parser.mutateState(new State(), interpreter);

    var events = interpreter.getEvents();

    var notes = [
      { tick: 48, note: 'C5' },
      { tick: 96, note: 'D5' },
      { tick: 144, note: 'E5' }
    ];
    var expectedNotes = [];

    for (var i = 0; i < 3; i++) {
      notes.forEach(n => {
        expectedNotes.push({ tick: n.tick + (i * 3 * 48), note: n.note });
      });
    }

    expectedNotes.forEach(n => {
      var note = events.filter(e => {
        return e.type === eventType.noteon &&
          e.tick === n.tick &&
          e.pitch.string === n.note;
      });
      expect(note.length).toExist();
    });

  })
});
