var easymidi = require('easymidi');
var output = new easymidi.Output('IAC Driver Bus 1');
var interpreter = require('./ample-interpreter');

var players;
function makeSong(song, rules, conductor, iterations) {
  var parts = [];
  players = song.players;
  players.forEach(function (player, i) {

    if (!player.part) { //legacy
      player = {
        part: player,
        channel: i + 1
      };
      players[i] = player;
    }

    parts.push(makePart(player.part, rules, conductor, iterations, i));
  });
  return parts;
}


function makePart(part, rules, conductor, iterations, playerId) {
  playerId = playerId || 0;

  part = substitute(part, rules, iterations, 0);

  var messages = interpreter.send(playerId, part, conductor);

  return { part: part, messages: messages };
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

  return {
    play: function () {
      var tickCount = 0;
      var interval = setInterval(onTick, 10);
      var messages = [];
      parts.forEach(function (part) {
        messages = messages.concat(part.messages);
      });
     
      function onTick() {
        var tickMessages = messages.filter(function (message) {
          return message.tick === tickCount;
        });
        tickMessages.forEach(function (message) {
          console.log(message);
          if (!message.sent) {
              output.send(message.type, {
            note: message.pitch,
            velocity: message.velocity,
            channel: message.channel
          });
          message.sent = true;
          }
        
        });

        tickCount ++;
      }

      return parts;
    }
  }
}

module.exports = {
  make: make
};


