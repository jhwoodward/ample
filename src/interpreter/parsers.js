var main = [
  require('./parsers/ScaleParser'),
  require('./parsers/KeyParser'),
  require('./parsers/BassConstraintParser'),
  require('./parsers/ChordConstraintParser'),
  require('./parsers/ScaleConstraintParser'),
  require('./parsers/ArpeggioOrnamentParser'),
  require('./parsers/TurnOrnamentParser'),
  require('./parsers/TrillOrnamentParser'),
  require('./parsers/AnimationParser'),
  require('./parsers/ParallelParser'),
  require('./parsers/MirrorParser'),
  require('./parsers/NthTimeParser'),
  require('./parsers/LoopParser'),
  require('./parsers/MarkerParser'),
  require('./parsers/IgnoreShuffleSetterParser'),
  require('./parsers/IgnoreSubstitutionSetterParser'),
  require('./parsers/SubstitutionParser'),
  require('./parsers/ShuffleParser'),
  require('./parsers/IgnoreAnnotationSetterParser'),
  require('./parsers/AnnotationParser'),
  require('./parsers/KeyswitchParser'),
  require('./parsers/KeyParser'),
  require('./parsers/ControllerParser'),
  require('./parsers/DurationParser'),
  require('./parsers/NoteParser'),
  require('./parsers/OctaveParser'),
  require('./parsers/PitchbendParser'),
 // require('./parsers/RelativeNoteParser'),
  require('./parsers/RestParser'),
  require('./parsers/SustainParser'),
  require('./parsers/TempoParser'),
  require('./parsers/TransposeParser'),
  require('./parsers/OnParser'),
  require('./parsers/OffParser'),
  require('./parsers/VelocityParser')
];

var setter = [
  require('./parsers/ShuffleSetterParser'),
  require('./parsers/SubstitutionSetterParser'),
  require('./parsers/AnnotationSetterParser')
];

var master = [
  require('./parsers/IgnoreSubstitutionSetterParser'),
  require('./parsers/SubstitutionParser'),
  require('./parsers/TempoParser'),
  require('./parsers/DurationParser'),
  require('./parsers/RestParser'),
  require('./parsers/SustainParser'),
  require('./parsers/MasterScaleParser'),
  require('./parsers/MasterBassParser'),
  require('./parsers/MasterMarkerParser')
];

module.exports = { main, setter, master };