var MidiPlayer = require('midi-player-js');
var easymidi = require('easymidi');
var output;

function onMidiEvent(event) {
  console.log(event);
  if (event.name === 'Note off' || event.name === 'Note on') {
    output.send(event.name.toLowerCase().replace(' ', ''), {
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
  Player.play();
}