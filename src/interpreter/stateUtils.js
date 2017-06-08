var parse = require('./parse');
var AnnotationParser = require('./parsers/AnnotationParser');
var parsers = require('./parsers').main;

var api = {
  getDefaultPhraseParser: function (macros) {
    var parsed;
    macros = macros || [];
    var defaultAnnotation = macros.filter(m => m.type === 'annotation' && m.key === 'default');
    if (defaultAnnotation.length) {
      parsed = defaultAnnotation[0];
    } else {
      var defaultPhrase = '8192=P 85=C1 90=V 0=ON -5=OFF';
      var parsed = {
        type: 'annotation',
        key: 'default',
        source: 'default',
        value: defaultPhrase,
        parsed: parse(parsers, defaultPhrase)
      };
      //add to macros for future use... impure
      macros.push(parsed);
    }
    var annotation = new AnnotationParser();
    annotation.parsed = parsed;
    annotation.string = 'init';
    return annotation;
  }

}

module.exports = api;