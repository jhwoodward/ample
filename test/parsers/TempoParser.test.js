var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var TempoParser = require('../../src/interpreter/parsers/TempoParser');
var State = require('../../src/interpreter/State');


  describe('TempoParser', function() {
    
    it('should parse', function() {
      var parser = new TempoParser();
      var test = '125=T';
      var found = parser.match(test);
      expect(found).toExist();
      expect(parser.string).toEqual(test);
      expect(parser.parsed.value).toEqual(125);
    });

    it ('should mutate state', function() {
      var parser = new TempoParser();
      var test = '125=T';
      parser.match(test);
      var state = new State().clone();
      expect(state.time.tempo).toEqual(120); //defult
      parser.mutateState(state);
      expect(state.time.tempo).toEqual(125);
    });

    it ('should generate event', function() {
      var parser = new TempoParser();
      var test = '125=T';
      parser.match(test);
      var state = new State().clone();
      var next = state.clone();
      parser.mutateState(state);

      var events = parser.getEvents(next, state);
      expect(events.length).toEqual(1);
      expect(events[0].tick).toEqual(state.time.tick);
      expect(events[0].type).toEqual(eventType.tempo);
      expect(events[0].value).toEqual(125);
    });
  });
