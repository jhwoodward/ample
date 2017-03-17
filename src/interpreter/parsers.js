var parsers = [
  require('./parsers/ScaleParser'),
  require('./parsers/KeyParser'),
  require('./parsers/LoopParser'),
  require('./parsers/SubstitutionParser'),
  require('./parsers/AnnotationParser'),
  require('./parsers/KeyswitchParser'),
  require('./parsers/KeyParser'),
  require('./parsers/ControllerParser'),
  require('./parsers/DurationParser'),
  require('./parsers/NoteParser'),
  require('./parsers/OctaveParser'),
  require('./parsers/PitchbendParser'),
  require('./parsers/RelativeNoteParser'),
  require('./parsers/RestParser'),
  require('./parsers/SustainParser'),
  require('./parsers/TempoParser'),
  require('./parsers/TransposeParser'),
  require('./parsers/OnParser'),
  require('./parsers/OffParser'),
  require('./parsers/VelocityParser')
];

module.exports = parsers;