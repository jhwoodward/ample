var expect = require('expect');
var eventType = require('../../src/interpreter/constants').eventType;
var AnnotationParser = require('../../src/interpreter/parsers/AnnotationParser');
var State = require('../../src/interpreter/State');


describe('AnnotationParser', function () {
  
  it('should parse', function () {
    var parser = new AnnotationParser();
    var test = '{default}';
    var found = parser.match(test);
    expect(found).toExist();
    expect(parser.string).toEqual(test);
  });

});
