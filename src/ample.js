var fs = require('fs');
var jsmidgen = require('jsmidgen');
var interpreter = require('./ample-interpreter');
var play = require('./play');

var file;
var tracks;

interpreter.listen(function (data) {
  if (data.note) {
     tracks[data.trackId].addNote(data.trackId, data.note.pitch, data.note.duration, data.note.delay, data.note.velocity);
  }
  if (data.tempo) {
    tracks[data.trackId].setTempo(data.tempo);
  }
 
});

function makeSong(song, rules, iterations) {
  var parts = [];
  song.parts.forEach(function (part, i) {
    parts.push(makePart(part, rules, iterations, i));
  });
  return parts;
}


function makePart(part, rules, iterations, trackId) {
  trackId = trackId || 0;
  var track = new jsmidgen.Track();
  tracks.push(track);
  file.addTrack(track);

  part = substitute(part, rules, iterations, 0);

  interpreter.send(trackId, part);

  return part;
}

function substitute(part, rules, iterations, i) {

  if (i < iterations) {
    for (var key in rules) {
      var re = new RegExp(key, 'g');
      part = part.replace(re, rules[key]);
    }
    //console.log('sub' + i + ' of ' + iterations,part);
    i += 1;
    return substitute(part, rules, iterations, i)
  } else {
    return part;
  }
}


function make(song, rules, iterations) {
  file = new jsmidgen.File({ ticks: 48 });
  tracks = [];
  var parts = [];

  rules = rules || {};
  iterations = iterations || (Object.keys(rules).length ? 10: 0);

  if (song.parts) {
    parts = makeSong(song, rules, iterations);
  } else {
    parts.push(makePart(song, rules, iterations));
  }

  var filename = song.name || 'song';
  filename = './' + filename + '.mid';
  fs.writeFileSync(filename, file.toBytes(), 'binary');

  return {
    play: function () {
      play(filename);
      return parts;
    }
  }
}

module.exports = {
  make: make,
  play: play
};


