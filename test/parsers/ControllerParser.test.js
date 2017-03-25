var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var ControllerParser = require('../../src/interpreter/parsers/ControllerParser');
var State = require('../../src/interpreter/State');


describe('ControllerParser', function () {
  it('should parse', function () {
    var parser = new ControllerParser();
    var test = '120=C1';
    var found = parser.match(test);
    expect(found).toExist();
    expect(parser.string).toEqual('120=C1');
    expect(parser.parsed.value).toEqual(120);
    expect(parser.parsed.controller).toEqual(1);
    expect(parser.parsed.phrase).toExist();
  });
  it('should mutate state', function () {
    var parser = new ControllerParser();
    var test = '120=C1';
    parser.match(test);
    var state = new State().clone();
    expect(state.controller[1]).toNotExist();
    parser.mutateState(state);
    expect(state.controller[1]).toEqual(120);
  });
  it('should generate event', function () {
    var parser = new ControllerParser();
    var test = '120=C1';
    parser.match(test);
    var state = new State().clone();
    parser.mutateState(state);
    expect(state.events.length).toEqual(1);
    expect(state.events[0].type).toEqual(eventType.controller);
    expect(state.events[0].tick).toEqual(state.time.tick);
    expect(state.events[0].controller).toEqual(1);
    expect(state.events[0].value).toEqual(120);
  });
});
