var fs = require('fs');
var jsmidgen = require('jsmidgen');
var interpreter = require('./ample-interpreter');
var play = require('./play');

function makeSong(song, tracks, file) {
  song.parts.forEach(function(part, i) {
    var track = new jsmidgen.Track();
    tracks.push(track);
    file.addTrack(track);
    interpreter.send(i, part);
  });
}


function makePart(part, tracks, file) {
  var track = new jsmidgen.Track();
  tracks.push(track);
  file.addTrack(track);
  interpreter.send(0, part);
}


function make(song) {
  var filename = song.name || 'song';
  filename = './' + filename + '.mid';
  var file = new jsmidgen.File({ticks:48});
  var tracks = [];

  interpreter.listen(function(trackId, note) {
    tracks[trackId].addNote(trackId+1, note.pitch, note.duration, note.delay, note.velocity);
  });

  if (song.parts) {
    makeSong(song, tracks, file);
  } else {
    makePart(song, tracks, file);
  }

  fs.writeFileSync(filename, file.toBytes(), 'binary');

  return {
    play: function() {
      play(filename);
    }
  }
}

module.exports = {
  make: make,
  play: play
};


