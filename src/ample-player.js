var fs = require('fs');
var jsmidgen = require('jsmidgen');
var ample = require('./ample');
var easymidi = require('easymidi');
var MidiPlayer = require('midi-player-js');
var output;
var Player = new MidiPlayer.Player(function(event) {
    // This function will get called for each event emitted by the player. 
   // console.log(event);
    if (event.name==='Note off' || event.name==='Note on') {

       output.send(event.name.toLowerCase().replace(' ',''), {
          note: event.noteNumber,
          velocity: event.velocity,
          channel: 1
        });
    }
});

function play(song, midiOutput) {

  output = new easymidi.Output(midiOutput);

  filename = song.name || 'song';
  filename = './' + filename + '.mid';

  var file = new jsmidgen.File();

  var tracks = [];

  ample.listen(function(trackId, note) {
  
    if (note.delay) {
      console.log('delay', note.delay);
    }
    tracks[trackId].addNote(1, note.pitch, note.duration * 128, note.delay * 128, note.velocity);
  
    
  });

  song.parts.forEach(function(part, i) {
    var track = new jsmidgen.Track();
    tracks.push(track);
    file.addTrack(track);
    ample.send(i, part);
  });

  fs.writeFileSync(filename, file.toBytes(), 'binary');
  Player.loadFile(filename);
  Player.play();
}

module.exports = play;


