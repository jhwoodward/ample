var parsers = [
  require('./parsers/AnnotationParser'),
  require('./parsers/KeyswitchParser'),
  require('./parsers/KeyParser'),
  require('./parsers/ControllerParser'),
  require('./parsers/DurationParser'),
  require('./parsers/KeyParser'),
  require('./parsers/NoteParser'),
  require('./parsers/OctaveParser'),
  require('./parsers/PitchbendParser'),
  require('./parsers/RelativeNoteParser'),
  require('./parsers/RestParser'),
  require('./parsers/ScaleParser'),
  require('./parsers/SustainParser'),
  require('./parsers/TempoParser'),
  require('./parsers/TransposeParser'),
  require('./parsers/OnParser'),
  require('./parsers/OffParser'),
  require('./parsers/VelocityParser')
];

parsers.forEach(parser => {
  parser.prototype.match = function match(s) {
    var result = this.test.exec(s);
    if (result) {
      this.string = result[0];
      this.parsed = this.parse(this.string);
    }
    return !!result;
  }
});

module.exports = parsers;