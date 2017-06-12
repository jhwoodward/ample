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
  require('./parsers/InvertParser'),
  require('./parsers/PingpongParser'),
  require('./parsers/ReverseParser'),
  require('./parsers/ShuffleParser'),
  require('./parsers/LoopParser'),
  require('./parsers/MarkerParser'),
  require('./parsers/IgnoreSubstitutionSetSetterParser'),
  require('./parsers/IgnoreSubstitutionSetterParser'),
  require('./parsers/SubstitutionSetParser'),
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
  //require('./parsers/ShuffleSetterParser'),
  //require('./parsers/ReverseSetterParser'),
   require('./parsers/AnnotationSetterParser'),
  require('./parsers/SubstitutionSetterParser'),
  require('./parsers/SubstitutionSetSetterParser')
 
];

var master = [
  require('./parsers/IgnoreSubstitutionSetSetterParser'),
  require('./parsers/IgnoreSubstitutionSetterParser'),
  require('./parsers/SubstitutionSetParser'),
  require('./parsers/SubstitutionParser'),
   require('./parsers/MasterScaleParser'),
  require('./parsers/MasterBassParser'),
  require('./parsers/MasterMarkerParser'),
  require('./parsers/InvertParser'),
  require('./parsers/PingpongParser'),
  require('./parsers/ReverseParser'),
  require('./parsers/ShuffleParser'),
  require('./parsers/LoopParser'),
  require('./parsers/TempoParser'),
  require('./parsers/DurationParser'),
  require('./parsers/RestParser'),
  require('./parsers/SustainParser'),
  require('./parsers/DurationParser'),
  require('./parsers/NoteParser'),
  require('./parsers/OctaveParser'),
 
];

module.exports = { main, setter, master };