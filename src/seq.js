var easymidi = require('easymidi');
var output = new easymidi.Output('IAC Driver Bus 1');
var colors = require('colors');
var pad = require('pad');
//var keypress = require('keypress');

var stopped = false;
var paused = false;
var space = '                                                            ';
var sPaused = '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - P A U S E D - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -'.magenta;
var sStart = '= = = = = = = = = = = = = = = = = = = = = = = = = = = = S T A R T = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ='.yellow;
var sEnd = '= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = E N D = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ='.red;
var sStopped = '= = = = = = = = = = = = = = = = = = = = = = = = = = = = = S T O P P E D = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ='.blue;
function allNotesOff() {

  setTimeout(offAll, 1);
  function off() {
    for (var i = 0; i < 10; i++) {
      for (var channelKey in noteState) {
        for (var noteKey in noteState[channelKey]) {
          if (noteState[channelKey][noteKey]) {
            output.send('noteoff', {
              note: noteKey,
              channel: channelKey
            });
            console.log('off: ' + channelKey + ', ' + noteKey)
          }
        }
      }
    }
  }

  function offAll() {
    for (var i = 0; i < 3; i++) {
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

var noteState ;
function resetNoteState() {
  noteState = {};
  for (var i = 0; i < 16; i++) {
    noteState[i] = {};
    for (var n = 0; n < 128; n++) {
      noteState[i][n] = false;
    }
  }
}

var interval = 10;
var tick = -1, endTick, maxTick, lastBeat, prLastBeat;
var timeout;
function onTick() {
  tick++;

  if (tick === 0) {
    console.log('\n');
    console.log(sStart);
  }

  indexed[tick].forEach(function (event) {

    if (event.type === 'noteon') {
      noteState[event.channel][event.pitch] = true;
    }



    //  logInfo(event);

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

    if (event.type === 'noteoff') {
      noteState[event.channel][event.pitch] = false;
    }

  });

  if (tick % 12 === 0) {
    logPianoRoll();
  }


  if (tick < maxTick && (!endTick || tick < endTick) && !stopped && !paused) {
    timeout = setTimeout(onTick, interval);
  } else if (!paused) {
    if (endTick < maxTick) {
      api.stop();
    } else if (!stopped) {
      api.end();
    }
  }
}
function logInfo(event) {


  var name = event.type;
  var data = [];
  var color;
  var log = '';
  var beat = Math.round(event.tick / 48);

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

  if (lastBeat !== beat) {
    log += colors.white(pad(5, beat.toString())) + '  ';
  } else {

    log += colors.gray(pad(5, beat.toString())) + '  ';
  }

  lastBeat = beat;
  if (event.channel) {
    log += colors.blue(pad((event.channel + 1).toString(), 3));
  } else {
    log += '   ';
  }

  log += color(pad(name, 10)) + '  ';
  log += color(pad(data.join('  '), 15));
  if (event.info) log += colors.gray(event.info) + '  ';
  console.log(log);



}


function logPianoRoll() {

  var beat = Math.round(tick / 48);

  var showBeat = !prLastBeat || beat !== prLastBeat;
  prLastBeat = beat;



  var pianoRoll = [];
  for (var channelKey in noteState) {
    for (var noteKey in noteState[channelKey]) {
      if (noteState[channelKey][noteKey]) {
        pianoRoll[noteKey] = channelKey;
      }
    }
  }

  var pianoRollLog = pad(showBeat ? beat.toString() : '', 3).white;
  for (var i = 0; i < 128; i++) {
    if (pianoRoll[i]) {
      var channel = parseInt(pianoRoll[i], 10) + 1;
      switch (channel) {
        case 0:
          pianoRollLog += channel.toString().black.bgWhite;
          break;
        case 1:
          pianoRollLog += channel.toString().black.bgYellow;
          break;
        case 2:
          pianoRollLog += channel.toString().black.bgCyan;
          break;
        case 3:
          pianoRollLog += channel.toString().black.bgGreen;
          break;
        case 4:
          pianoRollLog += channel.toString().black.bgBlue;
          break;
        case 5:
          pianoRollLog += channel.toString().black.bgRed;
          break;
        case 5:
          pianoRollLog += channel.toString().black.bgMagenta;
          break;
        default:
          pianoRollLog += channel.toString().black.bgWhite;
          break;
      }

    } else {

      pianoRollLog += '.'.grey;
    }
  }

  console.log(pianoRollLog);
}

var api = {
  stop: function () {
    var wasPlaying = !stopped;
    stopped = true;
    allNotesOff();
    console.log(sStopped);
    console.log('\n');
    process.stdin.removeListener('keypress', onKeyPress);

    return wasPlaying;
  },
  end: function () {
    console.log(sEnd);
    console.log('\n');
    stopped = true;
  },
  togglePause: function () {
    paused = !paused;
    if (!paused) {
      setTimeout(onTick, interval);
    } else {
      allNotesOff();
      console.log(sPaused);
    }

  },
  start: function (events, startBeat, endBeat) {
    resetNoteState();
    clearTimeout(timeout);
    process.stdin.removeListener('keypress', onKeyPress);
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

    timeout = setTimeout(onTick, interval);

  }
};
module.exports = api;
