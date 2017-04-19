var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var macroType = require('../../src/interpreter/constants').macroType;
var AnimationParser = require('../../src/interpreter/parsers/AnimationParser');
var State = require('../../src/interpreter/State');
var Interpreter = require('../../src/interpreter/Interpreter');
var parse = require('../../src/interpreter/parse');

describe('AnimationParser', function () {
  var macros = [
      {
        type: macroType.animation,
        key: 'swell',
        values: {
          0: '20=C1',
          25: '40=C1',
          50: '90=C1',
          100: '20=C1'
        }
      }
    ];

  var start = '<swell';
  var end = 'swell>';

  var tune = parse('48,0:cDEFG');

  it('should parse', function () {
  
    var parser = new AnimationParser(macros);
    var found = parser.match(start);
    expect(found).toExist();
    expect(parser.string).toEqual(start);
    expect(parser.parsed.start).toExist();
    expect(parser.parsed.end).toNotExist();

    var found = parser.match(end);
    expect(found).toExist();
    expect(parser.string).toEqual(end);
    expect(parser.parsed.end).toExist();
    expect(parser.parsed.start).toNotExist();
  });

  it('should mutate state', function () {
    var parser = new AnimationParser(macros);
    parser.match(start);
    var state = new State();
    var states = [state];
    expect(state.animation).toNotExist(); 
    state.mutate(parser);
    expect(state.animation).toExist();
    expect(state.animation.key).toEqual('swell');
    expect(state.animation.start).toExist();
    expect(state.animation.end).toNotExist();
    state = state.clone();

    tune.forEach(p => {
      state.mutate(p);
      expect(state.animation).toNotExist(); 
      states.push(state);
      state = state.clone();
      if (p.next) {
        p.next(state);
      }
      
    });

    parser.match(end);
    state.mutate(parser);
    states.push(state);
    expect(state.animation).toExist();
    expect(state.animation.key).toEqual('swell');
    expect(state.animation.start).toNotExist();
    expect(state.animation.end).toExist();

    var animations = states.reduce((acc,s) => {
      if (!s.animation) return acc;
      if (s.animation.start) {
        acc.push({ key: s.animation.key, start: s.time.tick });
        return acc
      }
      if (s.animation.end) {
        for (var i = acc.length-1; i>=0;i--) {
          if (acc[i].key === s.animation.key) {
            acc[i].end = s.time.tick;
            break;
          }
        }
      }
      return acc;
    },[]);

    expect(animations.length).toExist();
    expect(animations[0].key).toEqual('swell');
    expect(animations[0].start).toEqual(48);
    expect(animations[0].end).toEqual(288);

  });

 
});
