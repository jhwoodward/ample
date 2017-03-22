var easymidi = require('easymidi');
var colors = require('colors');
var eventType = require('./interpreter/constants').eventType;
var pad = require('pad');
var NanoTimer = require('nanotimer');
var timer = new NanoTimer();
var utils = require('./interpreter/utils');
var Interpreter = require('./interpreter/Interpreter');

var space = '                                                            ';
var sPaused = '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - P A U S E D - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -'.magenta;
var sStart = '= = = = = = = = = = = = = = = = = = = = = = = = = = = = S T A R T = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ='.yellow;
var sEnd = '= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = E N D = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ='.red;
var sStopped = '= = = = = = = = = = = = = = = = = = = = = = = = = = = = = S T O P P E D = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ='.blue;

function Sequencer() {
  this.stopped = false;
  this.paused = false;
  this.logMode = 'info';// 'pianoroll';

  this.timer = new NanoTimer();
  this.interval = 10000;
  this.tick = -1;
}

Sequencer.prototype = {

  load: function (players) {
    var allEvents = [];
    this.players = players;
    for (var key in players) {
      var player = players[key];
      delete player.annotations.name;
      var macros = utils.buildMacros(player.substitutions, player.annotations, player.articulations);
      var interpreter = new Interpreter(macros), events = [];
      if (typeof player.part === 'string') {
        var states = interpreter.interpret(player.part, player.master).states;
        this.markers = states[0].markers;
        events = utils.eventsFromStates(states);
      } else { //array of part objects
        player.part.forEach(p => {
          events = events.concat(utils.eventsFromStates(interpreter.interpret(p, player.master).states));
        });
      }
      events.forEach(e => { e.channel = player.channel });
      allEvents = allEvents.concat(events);
    }

    var errors = allEvents.filter(e => {
      return e.tick === undefined || isNaN(e.tick);
    });

    if (errors.length) {
      throw (new Error('Missing tick', errors.length));
    }

    allEvents = allEvents.sort(function (a, b) {
      return a.tick > b.tick ? 1 : -1;
    });

    this.events = allEvents;

    this.maxTick = this.events[this.events.length - 1].tick;
    this.indexed = {};
    for (var i = 0; i <= this.maxTick; i++) {
      this.indexed[i] = this.events.filter(function (event) {
        return event.tick === i;
      });
    }
  },
  start: function (options) {
    this.output = new easymidi.Output('IAC Driver Bus 1');
    if (!this.events) {
      throw (new Error('No players loaded'));
    }
    this.resetNoteState();
    this.timer.clearInterval();
    this.registerListeners();

    var startTick = 0;
    this.endTick = this.maxTick;


    if (options.startBeat) {
      startTick = (parseInt(startBeat, 10) * 48) - 12;
    }
    if (options.endBeat) {
      this.endTick = (parseInt(endBeat, 10) * 48);
    }

    var events = this.events;
    if (options.marker) {
      console.log(options.marker);
      var markerName = /[a-zA-Z]+/.exec(options.marker)[0];
      var markerNthTest = /\d+/.exec(options.marker);
      var markerNth = markerNthTest ? parseInt(markerNthTest[0], 10) : undefined;
      var markerTicks = this.markers[markerName];
      if (!markerNth) {
        startTick = markerTicks[0];
      } else {
        startTick = markerTicks[markerNth - 1];
      }

      var markersFlattened = [];
      for (var key in this.markers) {
        this.markers[key].forEach((tick, i) => {
          markersFlattened.push({ tick, marker: key + (i + 1).toString() });
        });
      }
      markersFlattened.sort((a, b) => {
        return a.tick > b.tick ? 1 : -1;
      });

      var thisMarker = markersFlattened.filter(m => { return m.tick === startTick; })[0];
      if (markersFlattened.indexOf(thisMarker) < markersFlattened.length - 1) {
        var nextMarker = markersFlattened[markersFlattened.indexOf(thisMarker) + 1];
        this.endTick = nextMarker.tick - 1;
      }
    }

    this.tick = 0;
    this.stopped = false;
    this.paused = false;
    this.fastForwarding = false;

    if (startTick > 0) {
      this.fastForward(startTick);
    } else {
      this.play();
    }

  },
  play: function () {
    console.log('\n');
    console.log(sStart);
    this.timer.setInterval(this.onTick.bind(this), '', this.interval + 'u');
  },
  fastForward: function (startTick) {
    this.ffendTick = this.endTick;
    this.endTick = startTick - 1;
    this.fastForwarding = true;
    this.timer.setInterval(this.onTick.bind(this), '', '10u');
  },
  onFastForwardCompleted: function () {
    this.timer.clearInterval();
    console.log('ff end ', this.tick);
    this.endTick = this.ffendTick;
    this.fastForwarding = false;
    this.play();
  },
  resetNoteState: function () {
    this.noteState = {};
    for (var i = 0; i < 16; i++) {
      this.noteState[i] = {};
      for (var n = 0; n < 128; n++) {
        this.noteState[i][n] = false;
      }
    }
  },
  allNotesOff: function () {


    for (var i = 0; i < 10; i++) {
      for (var channelKey in this.noteState) {
        for (var noteKey in this.noteState[channelKey]) {
          if (this.noteState[channelKey][noteKey]) {
            this.output.send('noteoff', {
              note: noteKey,
              channel: channelKey
            });
            this.noteState[channelKey][noteKey] = false;
          }
        }
      }
    }

    cnt = 0;
    for (var i = 0; i < 3; i++) {
      for (var c = 0; c < 16; c++) {
        for (var p = 0; p < 128; p++) {
          this.output.send('noteoff', {
            note: p,
            channel: c
          });
        }
      }
    }






  },
  registerListeners: function () {
    this.unregisterListeners();
    process.stdin.on('keypress', this.onKeyPress.bind(this));
  },
  unregisterListeners: function () {
    process.stdin.removeListener('keypress', this.onKeyPress.bind(this));
  },
  onKeyPress: function onKeyPress(ch, key) {
    if (!this.stopped) {
      if (key && key.name === 'escape') {
        this.stop();
      }
      if (key && key.name === 'space') {
        this.togglePause();
      }
    }
    /*
      if (key && key.name === 'i') {
        console.log('Log information'.green);
        this.setLogMode('info');
      }
      if (key && key.name === 'p') {
        console.log('Log piano roll'.green);
        this.setLogMode('pianoroll');
      }
    */
  },
  stop: function () {
    this.timer.clearInterval();
    this.stopped = true;
    this.allNotesOff();

    console.log(sStopped);
    console.log('\n');
    this.unregisterListeners();
  },
  end: function () {
    this.timer.clearInterval();
    this.stopped = true;
    this.allNotesOff();
    this.unregisterListeners();
    console.log(sEnd);
    console.log('\n');
  },
  togglePause: function () {
    this.paused = !this.paused;
    if (this.paused) {
      this.timer.clearInterval();
      this.allNotesOff();
      console.log(sPaused);
    } else {
      this.timer.setInterval(this.onTick.bind(this), '', this.interval + 'u');
    }

  },
  setLogMode: function (mode) {
    if (mode === 'info' || mode === 'pianoroll') {
      this.logMode = mode;
    } else {
      console.log('Invalid log mode: ${mode} (can be either info or pianoroll)'.red);
    }
  },
  onTick: function () {
    if (this.stopped || this.paused) return;

    if (this.tick > this.endTick) {
      if (this.fastForwarding) {
        this.onFastForwardCompleted();
      } else {
        this.end();
      }
      return;
    }

    this.indexed[this.tick].forEach(function (event) {

      if (!this.fastForwarding && this.logMode === 'info') {
        this.logInfo(event);
      }

      switch (event.type) {
        case eventType.tempo:
          var newInterval = Math.round(1000000 / (event.value * 0.8));
          if (newInterval !== interval) {
            this.interval = newInterval;
            this.timer.clearInterval();
            this.timer.setInterval(onTick, '', interval + 'u');
          }
          break;
        case eventType.controller:

          this.output.send(eventType.controller, {
            value: event.value,
            controller: event.controller,
            channel: event.channel
          });

          break;
        case eventType.pitchbend:

          this.output.send(eventType.pitchbend, {
            value: event.value,
            channel: event.channel
          });
          event.sent = true;

          break;
        case eventType.noteon:
          if (!this.fastForwarding || event.keyswitch) {
            this.output.send(eventType.noteon, {
              note: event.pitch.value,
              velocity: event.velocity || 80,
              channel: event.channel
            });
            this.noteState[event.channel][event.pitch.value] = event.keyswitch ? 'keyswitch' : true;
          }
          break;
        case eventType.noteoff:
          if (!this.fastForwarding || event.keyswitch) {
            this.output.send(eventType.noteoff, {
              note: event.pitch.value,
              channel: event.channel
            });
            this.noteState[event.channel][event.pitch.value] = false;
          }
          break;
        default:
          throw 'Unknown event type: ' + event.type
          break
      }

    }.bind(this));

    if (!this.fastForwarding && this.logMode === 'pianoroll' && this.tick % 12 === 0) {
      this.logPianoRoll();
    }

    this.tick++;

  },
  logInfo: function (event) {

    var name = event.type;
    var data = [];
    var color = colors.grey;
    var log = '';
    var beat = Math.floor(event.tick / 48);

    switch (event.type) {
      case eventType.noteon:
        if (!this.fastForwarding || event.keyswitch) {
          data.push(event.pitch.string + ' (' + event.pitch.value + ')');
          if (event.keyswitch) {
            name = 'noteon ks';
            color = colors.red;
          } else {
            color = colors.yellow;
            data.push(`v${event.velocity}`);
          }
          data.push(event.offset);
        }
        break;
      case eventType.noteoff:
        if (!this.fastForwarding || event.keyswitch) {
          if (event.keyswitch) {
            name = 'noteoff ks';
          }
          color = colors.grey;
          data.push(event.pitch.string + ' (' + event.pitch.value + ')');
          data.push(`d${event.duration}`);
          data.push(event.offset);
        }
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

    if (event.modifiers) {
      data.push(event.modifiers);
    }

    log += colors.gray(pad(5, event.tick.toString())) + ' ';
    if (this.lastBeat !== beat) {
      log += colors.white(pad(5, beat.toString())) + '  ';
    } else {

      log += colors.gray(pad(5, beat.toString())) + '  ';
    }

    this.lastBeat = beat;
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

    console.log(log);
  },
  logPianoRoll: function () {

    var beat = Math.floor(this.tick / 48);
    var showBeat = beat > 0 && (!this.prLastBeat || beat !== this.prLastBeat);
    this.prLastBeat = beat;

    var pianoRoll = [];
    for (var channelKey in this.noteState) {
      for (var noteKey in this.noteState[channelKey]) {
        if (this.noteState[channelKey][noteKey]) {
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
}

module.exports = Sequencer;
