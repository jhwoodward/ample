var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var MarkerReadParser = require('../../src/interpreter/parsers/MarkerReadParser');
var State = require('../../src/interpreter/State');
var Interpreter = require('../../src/interpreter/Interpreter');

  describe('MarkerReadParser', function() {
    it('should parse', function() {
      var parser = new MarkerReadParser();
      var test = '$A( 48,0:cDEFG )';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      expect(parser.parsed.name).toEqual('A');
    });
    it ('should mutate state', function() {
      var parser = new MarkerReadParser();
      var test = '$A( 48,0:cDE )';
      parser.match(test);
      var state = new State();
      var interpreter = new Interpreter();
      interpreter.states = [state];
      interpreter.master.marker = {
        A: [100, 2000, 3000]
      };
      state.mutate(parser, interpreter);
      var expectedNotes = [
        {  tick: 100, note: 'C5' },
        {  tick: 148, note: 'D5' },
        {  tick: 196, note: 'E5' },
        {  tick: 2000, note: 'C5' },
        {  tick: 2048, note: 'D5' },
        {  tick: 2096, note: 'E5' },
        {  tick: 3000, note: 'C5' },
        {  tick: 3048, note: 'D5' },
        {  tick: 3096, note: 'E5' }
      ];

      var events = interpreter.getEvents();

      expectedNotes.forEach(n => {
        var note = events.filter(e =>{
          return e.type === eventType.noteon &&
            e.tick === n.tick &&
            e.pitch.string === n.note;
        });
        expect(note.length).toExist();
      });

    })
  });
