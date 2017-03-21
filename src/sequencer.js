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
  this.output = new easymidi.Output('IAC Driver Bus 1');
  this.timer = new NanoTimer();
  this.interval = 10000;
  this.tick = -1;
}

Sequencer.prototype = {

  load: function (players) {
    var allEvents = [];
    for (var key in players) {
      var player = players[key];
      delete player.annotations.name;
      var macros = utils.buildMacros(player.substitutions, player.annotations, player.articulations);
      var interpreter = new Interpreter(macros), events = [];
      if (typeof player.part === 'string') {
        events = utils.eventsFromStates(interpreter.interpret(player.part, player.master).states);
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
  start: function (startBeat, endBeat) {
    if (!this.events) {
      throw (new Error('No players loaded'));
    }
    this.resetNoteState();
    this.timer.clearInterval();
    this.registerListeners();

    this.startTick = -1;
    if (startBeat) {
      this.startTick = (parseInt(startBeat, 10) * 48) - 12;
    }
    if (endBeat) {
      this.endTick = (parseInt(endBeat, 10) * 48);
    }
    console.log('\n');

    this.stopped = false;
    this.paused = false;
    this.tick = this.startTick;
    this.timer.setInterval(this.onTick.bind(this), '', this.interval + 'u');
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


    function off() {
      for (var i = 0; i < 10; i++) {
        for (var channelKey in this.noteState) {
          for (var noteKey in this.noteState[channelKey]) {
            if (this.noteState[channelKey][noteKey]) {
              this.output.send('noteoff', {
                note: noteKey,
                channel: channelKey
              });
              console.log('off: ' + channelKey + ', ' + noteKey)
            }
          }
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
    
      if (key && key.name === 'i') {
        console.log('Log information'.green);
        this.setLogMode('info');
      }
      if (key && key.name === 'p') {
        console.log('Log piano roll'.green);
        this.setLogMode('pianoroll');
      }
    
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

    this.tick++;

    if (this.tick === 0) {
      console.log('\n');
      console.log(sStart);
    }

    this.indexed[this.tick].forEach(function (event) {
      if (event.type === eventType.noteon) {
        this.noteState[event.channel][event.pitch.value] = event.keyswitch ? 'keyswitch' : true;
      }

      if (this.logMode === 'info') {
        this.logInfo(event);
      }

      switch (event.type) {
        case eventType.tempo:
          var newInterval = Math.round(1000000 / (event.value * 0.8));
          if (newInterval !== interval) {
            interval = newInterval;
            this.timer.clearInterval();
            this.timer.setInterval(onTick, '', interval + 'u');
          }
          break;
        case eventType.controller:
          if (!event.sent) {
            this.output.send(eventType.controller, {
              value: event.value,
              controller: event.controller,
              channel: event.channel
            });
            event.sent = true;
          }
          break;
        case eventType.pitchbend:
          if (!event.sent) {
            this.output.send(eventType.pitchbend, {
              value: event.value,
              channel: event.channel
            });
            event.sent = true;
          }
          break;
        case eventType.noteon:
          if (!event.sent) {
            this.output.send(eventType.noteon, {
              note: event.pitch.value,
              velocity: event.velocity || 80,
              channel: event.channel
            });
            event.sent = true;
          }
          break;
        case eventType.noteoff:
          if (!event.sent) {
            this.output.send(eventType.noteoff, {
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
        this.noteState[event.channel][event.pitch.value] = false;
      }

    }.bind(this));

    if (this.logMode === 'pianoroll' && this.tick % 12 === 0) {
      this.logPianoRoll();
    }

    if (this.tick < this.maxTick &&
      (!this.endTick || this.tick < this.endTick) &&
      !this.stopped && !this.paused) {
      // do nothing
    } else if (!this.paused) {
      if (this.endTick < this.maxTick) {
        this.stop();
      } else if (!this.stopped) {
        this.end();
      }
    }
  },
  logInfo: function (event) {

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
