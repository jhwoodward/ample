var parsers = [
  require('./parsers/ScaleParser'),
  require('./parsers/KeyParser'),
  require('./parsers/BassConstraintParser'),
  require('./parsers/ChordConstraintParser'),
  require('./parsers/AnimationParser'),
  require('./parsers/ParallelParser'),
  require('./parsers/MirrorParser'),
  require('./parsers/NthTimeParser'),
  require('./parsers/LoopParser'),
  require('./parsers/MarkerParser'),
  require('./parsers/IgnoreSubstitutionSetterParser'),
  require('./parsers/SubstitutionParser'),
  require('./parsers/IgnoreAnnotationSetterParser'),
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
var setterParsers = [
  require('./parsers/SubstitutionSetterParser'),
  require('./parsers/AnnotationSetterParser')
];
var masterParsers = [
  require('./parsers/MasterScaleParser'),
  require('./parsers/MasterBassParser'),
  require('./parsers/MasterMarkerParser')
]

module.exports = {
  main: parsers,
  setter: setterParsers,
  master: masterParsers
};