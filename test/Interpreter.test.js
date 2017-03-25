var expect = require('expect');
var eventType = require('../src/interpreter/constants').eventType;
var AnnotationParser = require('../src/interpreter/parsers/AnnotationParser');
var State = require('../src/interpreter/State');
var Interpreter = require('../src/interpreter/Interpreter');
var utils = require('../src/interpreter/utils')

describe('Interpreter', function () {
  
  it('should interpret', function () {;

    var annotations = {
      default: '[-3:C] [-2:D] 85=C1 8192=P 0=ON -5=OFF',
      detached: '[-3:C] 8192=P 0=ON -5=OFF',
      staccato: '[-3:+D]',
      p: '50=C1',
      f: '120=C1 120=V',
      legato: '[-3:C] 8192=P -12=ON 1=OFF',
      slow: '-12=ON 1=OFF',
      fast: '-3=ON 1=OFF',
      spiccato: '[-3:D]',
      pizzicato: '[-3:E] 50=C1',
      accent: '[-3:C] 120=C1 16383=P ',
      portamento: '0=P  -12=ON 1=OFF'
    };

    var player = {
      name: 'trumpet',
      part: '48,0:cDEFG',
      channel: 0,
      annotations
    };

    var interpreter = new Interpreter(utils.combineMacros(player));
    var result = interpreter.interpret(player.part);
    expect(result.events).toExist();
   

  });

});
