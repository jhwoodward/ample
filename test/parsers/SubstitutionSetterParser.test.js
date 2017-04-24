var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var macroType = require('../../src/interpreter/constants').macroType;
var SubstitutionSetterParser = require('../../src/interpreter/parsers/SubstitutionSetterParser');
var Interpreter = require('../../src/interpreter/Interpreter');

describe('SubstitutionSetterParser', function () {

  it('should parse and add the macro', function () {
    var test = '(a)=(cDEFGABC)';
    var interpreter = new Interpreter();
    interpreter.parseMacros(test);
    var macros = interpreter.macros.filter(m => m.type === 'substitution' && m.key === 'a');
    expect(macros.length).toEqual(1);
  });

});

