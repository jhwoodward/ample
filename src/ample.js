var fs = require('fs');
var jsmidgen = require('jsmidgen');
var interpreter = require('./ample-interpreter');
var play = require('./play');

var file;
var tracks;

interpreter.listen(function (data) {

tracks[data.playerId].addEvent(
  new jsmidgen.Event({
			type: jsmidgen.Event.CONTROLLER,
			channel: players[data.playerId].channel-1,
			param1: 64,
      param2:127,
			time: 0
		}
));


  if (data.note) {


    tracks[data.playerId].addNoteOn(
      players[data.playerId].channel-1,
      data.note.pitch,
    //  data.note.duration,
      data.note.delay,
      data.note.velocity);

    tracks[data.playerId].addNoteOff(
      players[data.playerId].channel-1,
      data.note.pitch,
      data.note.duration + 10,
      data.note.delay,
      data.note.velocity);
  }
  if (data.tempo) {
    tracks[data.playerId].setTempo(data.tempo);
  }

});

var players;
function makeSong(song, rules, conductor, iterations) {
  var parts = [];
  players = song.players;
  players.forEach(function (player, i) {

    if (!player.part) { //legacy
      player = {
        part: player,
        channel: i+1
      };
      players[i] = player;
    }

    parts.push(makePart(player.part, rules, conductor, iterations, i));
  });
  return parts;
}


function makePart(part, rules, conductor, iterations, playerId) {
  playerId = playerId || 0;
  var track = new jsmidgen.Track();
  tracks.push(track);
  file.addTrack(track);

  part = substitute(part, rules, iterations, 0);

  interpreter.send(playerId, part, conductor);

  return part;
}

function substitute(part, rules, iterations, i) {

  if (i < iterations) {
    for (var key in rules) {
      var re = new RegExp(key, 'g');
      part = part.replace(re, rules[key]);
    }
    i += 1;
    return substitute(part, rules, iterations, i)
  } else {
    return part;
  }
}


function make(song, rules, conductor, iterations) {
  file = new jsmidgen.File({ ticks: 48 });
  tracks = [];
  var parts = [];

  rules = rules || {};
  iterations = iterations || (Object.keys(rules).length ? 10 : 0);

  if (song.parts) { //legacy
    song.players = song.parts;
  }

  if (song.players) {
    players = song.players;
    parts = makeSong(song, rules, conductor, iterations);
  } else {
    players = [{ channel: 1 }];
    parts.push(makePart(song, rules, conductor, iterations));
  }

  var filename = song.name || 'song';
 // if (fs.existsSync('./midi/' + filename + '.mid')) {
 //   filename += '_' + new Date().getTime();
 // }
  filename = './midi/' + filename + '.mid';
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


