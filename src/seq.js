var easymidi = require('easymidi');
var output = new easymidi.Output('IAC Driver Bus 1');
var colors = require('colors');
var pad = require('pad');
//var keypress = require('keypress');

var stopped = false;
var paused = false;
var space = '                                                            ';
function allNotesOff() {
  for (var i = 0; i < 10; i++) {
    for (var c = 0; c < 16; c++) {
      for (var p = 0; p < 128; p++) {
        output.send('noteoff', {
          note: p,
          channel: c
        });
      }
    }

  }
}

function onKeyPress(ch, key) {
  //  console.log('got "keypress"', key);
  if (!stopped) {
    if (key && key.name == 'escape') {
      api.stop();
    }
    if (key && key.name == 'space') {
      api.togglePause();
    }
  }

}

var indexed = {};
var interval = 10;
var tick = -1, endTick, maxTick, lastBeat;
function onTick() {
  tick++;

  if (tick === 0) {
    console.log('\n');
    console.log(space.bgGreen);
  }

  indexed[tick].forEach(function (event) {

    var log = '';
    var data = [];
    var color;

    var name = event.type;

    switch (event.type) {
      case 'noteon':

        data.push(event.char);
        data.push(`p${event.pitch}`);

        if (event.keyswitch) {
          name = 'keyswitch';
          color = colors.red;
        } else {
          color = colors.yellow;
          data.push(`v${event.velocity}`);
        }



        break;
      case 'noteoff':
        if (event.keyswitch) {
          name = 'ks off';
        }
        color = colors.grey;
        data.push(event.char);
        data.push(`p${event.pitch}`);
        data.push(`dur${event.duration}`);
        break;
      case 'pitch':
        color = colors.red;
        data.push(event.value);
        break;
      case 'cc':
        color = colors.red;
        data.push(`cc${event.controller}`);
        data.push(`${event.value}`);
        break;
      case 'tempo':
        color = colors.blue;
        data.push(event.tempo);
        break;
    }

    var beat = Math.round(event.tick / 48);
    if (lastBeat !== beat) {
      log += colors.bgBlue(pad(5, beat.toString())) + '  ';
    } else {

      log += colors.gray(pad(5, beat.toString())) + '  ';
    }

    if (event.channel) {
      log += colors.blue(pad((event.channel + 1).toString(), 3));
    } else {
      log += '   ';
    }

    log += color(pad(name, 10)) + '  ';
    log += color(pad(data.join('  '), 15));
    if (event.info) log += colors.gray(event.info) + '  ';
    console.log(log);

    lastBeat = beat;

    if (event.type === 'tempo') {
      interval = 1000 / (event.tempo * 0.8);

    } else if (!event.sent) {
      output.send(event.type, {
        value: event.value,
        controller: event.controller,
        note: event.pitch,
        velocity: event.velocity,
        channel: event.channel
      });
      event.sent = true;
    }


  });

  if (tick < maxTick && (!endTick || tick < endTick) && !stopped && !paused) {
    setTimeout(onTick, interval);
  } else if (!paused) {
    if (endTick < maxTick) {
      api.stop();
    } else if (!stopped) {
      console.log(space.bgGreen);
      stopped = true;
    }
  }
}

var api = {
  stop: function () {
    var wasPlaying = !stopped;
    stopped = true;
    allNotesOff();
    console.log(space.bgBlue);
    process.stdin.removeListener('keypress', onKeyPress);

    return wasPlaying;
  },
  togglePause: function () {
    paused = !paused;
    if (!paused) {
      setTimeout(onTick, interval);
    } else {
      allNotesOff();
      console.log(space.bgMagenta);
    }

  },
  start: function (events, startBeat, endBeat) {
    //keypress(process.stdin);
    process.stdin.on('keypress', onKeyPress);

    var startTick = -1;

    if (startBeat) {
      startTick = (parseInt(startBeat, 10) * 48) - 1;
    }
    if (endBeat) {
      endTick = (parseInt(endBeat, 10) * 48);
    }

    stopped = false;
    paused = false;

    tick = startTick;
    maxTick = events.reduce(function (acc, event) {
      if (event.tick > acc) {
        return event.tick;
      } else {
        return acc;
      }
    }, 0);

    indexed = {};
    for (var i = 0; i <= maxTick; i++) {
      indexed[i] = events.filter(function (event) {
        return event.tick === i;
      });
    }

    setTimeout(onTick, interval);

  }
};
module.exports = api;
