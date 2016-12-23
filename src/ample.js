var fs = require('fs');
var jsmidgen = require('jsmidgen');
var interpreter = require('./ample-interpreter');
var play = require('./play');

var file = new jsmidgen.File({ticks:48});
var tracks = [];

interpreter.listen(function(trackId, note) {
  tracks[trackId].addNote(trackId, note.pitch, note.duration, note.delay, note.velocity);
});

function makeSong(song, rules, iterations) {
  song.parts.forEach(function(part, i) {
    makePart(part, rules, iterations, i);
  });
}


function makePart(part, rules, iterations, trackId) {
  trackId = trackId || 0;
  var track = new jsmidgen.Track();
  tracks.push(track);
  file.addTrack(track);

  //string substitution
  for (var i = 0; i < iterations; i++) {
    for (var key in rules) {
      var re = new RegExp(key, 'g');
      part = part.replace(re,rules[key]);
    }
  }

  console.log(part);
  

  interpreter.send(trackId, part);
}


function make(song, rules, iterations) {

  if (song.parts) {
    makeSong(song, rules, iterations);
  } else {
    makePart(song, rules, iterations);
  }

  var filename = song.name || 'song';
  filename = './' + filename + '.mid';
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


