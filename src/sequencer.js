var easymidi = require('easymidi');
var output = new easymidi.Output('IAC Driver Bus 1');
var colors = require('colors');
var eventType = require('./interpreter/constants').eventType;
var pad = require('pad');
var NanoTimer = require('nanotimer');
var timer = new NanoTimer();
var utils = require('./interpreter/utils');
var Interpreter = require('./interpreter/Interpreter');

var stopped = false;
var paused = false;
var space = '                                                            ';
var sPaused = '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - P A U S E D - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -'.magenta;
var sStart = '= = = = = = = = = = = = = = = = = = = = = = = = = = = = S T A R T = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ='.yellow;
var sEnd = '= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = E N D = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ='.red;
var sStopped = '= = = = = = = = = = = = = = = = = = = = = = = = = = = = = S T O P P E D = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ='.blue;

var logMode = 'info';// 'pianoroll';

function allNotesOff() {

  offAll();
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

  if (!stopped) {
    if (key && key.name === 'escape') {
      api.stop();
    }
    if (key && key.name === 'space') {
      api.togglePause();
    }
  }

  /*
    if (key && key.name === 'f1') {
      console.log('Log information'.green);
      logMode = 'info';
    }
    if (key && key.name === 'f2') {
      console.log('Log piano roll'.green);
      logMode = 'pianoroll';
    }
  */

}

var indexed = {};

var noteState;
function resetNoteState() {
  noteState = {};
  for (var i = 0; i < 16; i++) {
    noteState[i] = {};
    for (var n = 0; n < 128; n++) {
      noteState[i][n] = false;
    }
  }
}

var interval = 10000;
var tick = -1, endTick, maxTick, lastBeat, prLastBeat;
var timeout;
function onTick() {
  if (stopped || paused) return;

  tick++;

  if (tick === 0) {
    console.log('\n');
    console.log(sStart);
  }

  indexed[tick].forEach(function (event) {
    if (event.type === eventType.noteon) {
      noteState[event.channel][event.pitch.value] = event.keyswitch ? 'keyswitch' : true;
    }

    if (logMode === 'info') {
      logInfo(event);
    }

    switch (event.type) {
      case eventType.tempo:
        var newInterval = Math.round(1000000 / (event.value * 0.8));
        if (newInterval !== interval) {
          interval = newInterval;
          timer.clearInterval();
          timer.setInterval(onTick, '', interval + 'u');
        }
        break;
      case eventType.controller:
        if (!event.sent) {
          output.send(eventType.controller, {
            value: event.value,
            controller: event.controller,
            channel: event.channel
          });
          event.sent = true;
        }
        break;
      case eventType.pitchbend:
        if (!event.sent) {
          output.send(eventType.pitchbend, {
            value: event.value,
            channel: event.channel
          });
          event.sent = true;
        }
        break;
      case eventType.noteon:
        if (!event.sent) {
          output.send(eventType.noteon, {
            note: event.pitch.value,
            velocity: event.velocity || 80,
            channel: event.channel
          });
          event.sent = true;
        }
        break;
      case eventType.noteoff:
        if (!event.sent) {
          output.send(eventType.noteoff, {
            note: event.pitch.value,
            channel: event.channel
          });
          event.sent = true;
        }
        break;
      default:
        throw 'Unknown event type: ' + event.type
        break
    }

    if (event.type === eventType.noteoff) {
      noteState[event.channel][event.pitch.value] = false;
    }

  });

  if (logMode === 'pianoroll' && tick % 12 === 0) {
    logPianoRoll();
  }


  if (tick < maxTick && (!endTick || tick < endTick) && !stopped && !paused) {


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
  var beat = Math.floor(event.tick / 48);

  switch (event.type) {
    case eventType.noteon:
      data.push(event.pitch.string + ' (' + event.pitch.value + ')');
      if (event.keyswitch) {
        name = 'noteon ks';
        color = colors.red;
      } else {
        color = colors.yellow;
        data.push(`v${event.velocity}`);
      }
      data.push(event.offset);
      break;
    case eventType.noteoff:
      if (event.keyswitch) {
        name = 'noteoff ks';
      }
      color = colors.grey;
      data.push(event.pitch.string + ' (' + event.pitch.value + ')');
      data.push(`d${event.duration}`);
      data.push(event.offset);

      break;
    case eventType.pitchbend:
      color = colors.red;
      data.push(event.value);
      break;
    case eventType.controller:
      color = colors.red;
      name = `cc ${event.controller}`;
      data.push(`${event.value}`);
      break;
    case eventType.tempo:
      color = colors.blue;
      data.push(event.tempo);
      break;
  }

  if (event.annotation) {
    data.push(event.annotation);
  }
  if (event.articulation) {
    data.push(event.articulation);
  }


  log += colors.gray(pad(5, event.tick.toString())) + ' ';
  if (lastBeat !== beat) {
    log += colors.white(pad(5, beat.toString())) + '  ';
  } else {

    log += colors.gray(pad(5, beat.toString())) + '  ';
  }

  lastBeat = beat;
  if (event.channel !== undefined) {
    log += colors.blue(pad((event.channel + 1).toString(), 3));
  } else {
    log += '   ';
  }

  log += color(pad(name, 10)) + '  ';
  data.forEach(d => {
    if (d !== undefined) {
      log += color(pad(15, d));
    }

  })

  // if (event.info) log += colors.gray(event.info) + '  ';
  console.log(log);
}


function logPianoRoll() {

  var beat = Math.floor(tick / 48);
  var showBeat = beat > 0 && (!prLastBeat || beat !== prLastBeat);
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
    timer.clearInterval();
    stopped = true;
    allNotesOff();
    console.log(sStopped);
    console.log('\n');
    process.stdin.removeListener('keypress', onKeyPress);
  },
  end: function () {
    timer.clearInterval();
    console.log(sEnd);
    console.log('\n');
    stopped = true;
  },
  togglePause: function () {
    paused = !paused;
    if (paused) {
      timer.clearInterval();
      allNotesOff();
      console.log(sPaused);
    } else {
      timer.setInterval(onTick, '', interval + 'u');
    }

  },
  setLogMode: function (mode) {
    if (mode === 'info' || mode === 'pianoroll') {
      logMode = mode;
    } else {
      console.log('Invalid log mode: ${mode} (can be either info or pianoroll)'.red);
    }

  },
  start: function (events, startBeat, endBeat) {

    var errors = events.filter(e => {
      return e.tick===undefined || isNaN(e.tick);
    });

    if (errors.length) {
       throw ('Missing tick', errors);
    }

    events = events.sort(function (a, b) {
      return a.tick > b.tick ? 1 : -1;
    });

    resetNoteState();
    clearInterval(timeout);
    process.stdin.removeListener('keypress', onKeyPress);
    process.stdin.on('keypress', onKeyPress);
    var startTick = -1;
    if (startBeat) {
      startTick = (parseInt(startBeat, 10) * 48) - 12;
    }
    if (endBeat) {
      endTick = (parseInt(endBeat, 10) * 48);
    }
    console.log('\n');

    stopped = false;
    paused = false;

    tick = startTick;
    maxTick = events[events.length - 1].tick;

    indexed = {};
    for (var i = 0; i <= maxTick; i++) {
      indexed[i] = events.filter(function (event) {
        return event.tick === i;
      });
    }

    timer.setInterval(onTick, '', interval + 'u');

  },
  load: function (players) {
    var allEvents = [];
    for (var key in players) {
      var player = players[key];
      delete player.annotations.name;
      var macros = utils.buildMacros(player.substitutions, player.annotations, player.articulations);
      var interpreter = new Interpreter(macros);
      var result = interpreter.interpret(player.part);
      var events = utils.eventsFromStates(result.states);
      events.forEach(e => {
        e.channel = player.channel
      });
      allEvents = allEvents.concat(events);
    }

    api.start(allEvents);
  }
};
module.exports = api;
