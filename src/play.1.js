var MidiPlayer = require('midi-player-js');
var easymidi = require('easymidi');
var output;

function onMidiEvent(event) {

  var eventName = event.name.toLowerCase().replace(' ', '');
  
  if ((eventName === 'noteoff' || eventName === 'noteon') && event.noteName) {
    output.send(eventName, {
      note: event.noteNumber,
      velocity: event.velocity,
      channel: event.track
    });
  }
}

module.exports = function play(filename, midiOutput) {
  var Player = new MidiPlayer.Player(onMidiEvent);
  output = new easymidi.Output(midiOutput || 'IAC Driver Bus 1');
  Player.loadFile(filename);
  console.log('format: ' + Player.getFormat());
  Player.play();
}