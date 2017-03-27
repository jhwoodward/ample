var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var AnnotationParser = require('../../src/interpreter/parsers/AnnotationParser');
var State = require('../../src/interpreter/State');
var stateUtils = require('../../src/interpreter/stateUtils');

describe('AnnotationParser', function () {
  
  it('should parse', function () {
    var macros = [];
    stateUtils.getDefaultPhraseParser(macros);
    var a = new AnnotationParser(macros);
    var test = '{default}';
    var found = a.match(test);
    expect(found).toExist();
    expect(a.string).toEqual(test);
  });

});
