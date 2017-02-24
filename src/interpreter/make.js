var interpret = require('./interpret');
var seq = require('../sequencer');

function makeSong(song, rules, conductor, iterations) {
  var output = [];
  song.players.forEach(function (player, i) {
    if (!player.part) { //legacy
      player = {
        part: player,
        channel: i + 1
      };
    }
    player.id = i;
    output.push(generate(player));
  });
  return output;

  function generate(player) {
    player.score = substitute(player.part);
    var midi = interpret(player, conductor);
    return { player: player, midi: midi };
  }

  function substitute(part, i) {
    i = i || 0;
    if (i < iterations) {
      for (var key in rules) {
        var re = new RegExp(key + '(?![^{]*})','g'); //leave anything inside {} alone (annotations)
        part = part.replace(re, rules[key]);
      }
      i += 1;
      return substitute(part, i)
    } else {
      //strip out any remaining rules
      for (var key in rules) {
        var re = new RegExp(key + '(?![^{]*})','g'); //leave anything inside {} alone (annotations)
        part = part.replace(re, '');
      }
      return part;
    }
  }
}

function make(song, rules, conductor, iterations) {

  rules = rules || {};
  iterations = iterations || (Object.keys(rules).length ? 10 : 0);

  if (song.parts) { //legacy
    song.players = song.parts;
  }

  if (!song.players) {
    song = {
      players: [{part: song, channel: 1 }]
    };
  }

  var results = makeSong(song, rules, conductor, iterations);

  return {
    play: function (startBeat, endBeat) {
      var allMidi = [];
      results.forEach(function (result) {
        allMidi = allMidi.concat(result.midi);

      });
      seq.start(allMidi, startBeat, endBeat);
      return results;
    }
  }
}

module.exports = make;


