var parsers = [
  require('./MacroParser'),
  require('./KeyswitchParser'),
  require('./KeyParser'),
  require('./ControllerParser'),
  require('./DurationParser'),
  require('./KeyParser'),
  require('./NoteParser'),
  require('./OctaveParser'),
  require('./PitchbendParser'),
  require('./RelativeNoteParser'),
  require('./RestParser'),
  require('./ScaleParser'),
  require('./SustainParser'),
  require('./TempoParser'),
  require('./TransposeParser')
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