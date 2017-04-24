var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var macroType = require('../../src/interpreter/constants').macroType;
var AnnotationSetterParser = require('../../src/interpreter/parsers/AnnotationSetterParser');
var Interpreter = require('../../src/interpreter/Interpreter');

describe('AnnotationSetterParser', function () {

  it('should parse and add the macro', function () {
    var test = '{forward}={-10=ON}';
    var interpreter = new Interpreter();
    interpreter.parseMacros(test);
    var macros = interpreter.macros.filter(m => m.type === 'annotation' && m.key === 'forward');
    expect(macros.length).toEqual(1);
  });

});

