
var eventType = require('../interpreter/constants').eventType;
var utils = require('../interpreter/utils');
var Interpreter = require('../interpreter/Interpreter');

var space = '                                                            ';
var sPaused = '- - - - - - - - - - - - - - - - - - - - - - - - - - - - - P A U S E D - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -'.magenta;
var sStart = '= = = = = = = = = = = = = = = = = = = = = = = = = = = = S T A R T = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ='.yellow;
var sEnd = '= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = E N D = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ='.red;
var sStopped = '= = = = = = = = = = = = = = = = = = = = = = = = = = = = = S T O P P E D = = = = = = = = = = = = = = = = = = = = = = = = = = = = = ='.blue;

function Sequencer() {
  this.stopped = false;
  this.paused = false;
  this.logMode = 'info';// 'pianoroll';
  //this.output = new easymidi.Output('IAC Driver Bus 1');
  //this.timer = new NanoTimer();
  this.interval = 10000;
  this.tick = -1;
  //this.onKeyPress = this.onKeyPress.bind(this);
  this.onTick = this.onTick.bind(this);
}

function prepPlayers(players) {
  for (var key in players) {
    var player = players[key];
    delete player.annotations.name;
    player.macros = utils.combineMacros(player);
  }
  return players;
}

function getMarkers(master) {
  var markers = [];
  for (var key in master.marker) {
    master.marker[key].forEach((tick, i) => {
      markers.push({ tick, key: key + (i + 1).toString() });
    });
  }
  markers.sort((a, b) => {
    return a.tick > b.tick ? 1 : -1;
  });
  return markers;
}

Sequencer.prototype = {
  load: function (players) {
    players = prepPlayers(players);
    var events = [];
    var interpreter;
    for (var key in players) {
      console.log('Interpreting ' + key);
      interpreter = new Interpreter(players[key].macros, players[key].master);
      players[key].interpreted = interpreter.interpret(players[key].part);
      players[key].interpreted.events.forEach(e => { e.channel = players[key].channel });

      events = events.concat(players[key].interpreted.events);
    }

    var errors = events.filter(e => {
      return e.tick === undefined || isNaN(e.tick);
    });

    if (errors.length) {
      throw (new Error('Missing tick', errors.length));
    }

    events.sort(function (a, b) {
      if (a.tick === b.tick) return 0;
      return a.tick > b.tick ? 1 : -1;
    });

    console.log('indexing...')
    this.maxTick = events[events.length - 1].tick;
    this.events = {};
    for (var i = 0; i <= this.maxTick; i++) {
      this.events[i] = events.filter(function (e) {
        return e.tick === i;
      });
    }
  },
  start: function (options) {
    this.allNotesOff();
    options = options || {};

    if (!this.events) {
      throw (new Error('No players loaded'));
    }

    this.timer.clearInterval();
    process.stdin.on('keypress', this.onKeyPress);

    this.startTick = 0;
    this.endTick = this.maxTick;
    this.loop = options.loop;

    if (options.startBeat) {
      this.startTick = (parseInt(startBeat, 10) * 48) - 12;
    }
    if (options.endBeat) {
      this.endTick = (parseInt(endBeat, 10) * 48);
    }
    if (options.marker) {
      var markerName = /[a-zA-Z]+/.exec(options.marker)[0];
      var markerNthTest = /\d+/.exec(options.marker);
      markerName += markerNthTest ? parseInt(markerNthTest[0], 10) : '1';
      var marker = this.markers.filter(m => m.key === markerName);
      if (!marker.length) throw(new Error('Marker not found: ' + markerName));
      marker = marker[0]
      this.startTick = marker.tick;
      if (this.markers.indexOf(marker) < this.markers.length - 1) {
        var nextMarker = this.markers[this.markers.indexOf(marker) + 1];
        this.endTick = nextMarker.tick - 1;
      }
    }

    this.tick = 0;
    this.stopped = false;
    this.paused = false;
    this.fastForwarding = false;
    this.logger = new infoLogger(this.markers);

    if (this.startTick > 0) {
      this.fastForward();
    } else {
      this.play();
    }
  },
  play: function () {
    console.log('\n');
    console.log(sStart);
    this.timer.setInterval(this.onTick, '', this.interval + 'u');
  },
  fastForward: function () {
    this.ffendTick = this.endTick;
    this.endTick = this.startTick - 1;
    this.fastForwarding = true;
    this.timer.setInterval(this.onTick, '', '10u');
  },
  onFastForwardCompleted: function () {
    this.timer.clearInterval();
    console.log('ff end ', this.tick);
    this.endTick = this.ffendTick;
    this.fastForwarding = false;
    this.play();
  },
  allNotesOff: function () {
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
  switchOffAllTheShit: function () {
    this.timer.clearInterval();
    this.stopped = true;
    this.allNotesOff();
    process.stdin.removeListener('keypress', this.onKeyPress);
  },
  stop: function () {
    this.switchOffAllTheShit();
    console.log(sStopped);
    console.log('\n');
  },
  end: function () {
    this.switchOffAllTheShit();
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
      this.timer.setInterval(this.onTick, '', this.interval + 'u');
    }
  },
  onTick: function () {
    if (this.stopped || this.paused) return;
    if (this.tick > this.endTick) {
      if (this.fastForwarding) {
        this.onFastForwardCompleted();
        return;
      }
      if (this.loop) {
        this.tick = 0;
        this.timer.clearInterval();
        if (this.startTick > 0) {
          this.fastForward();
        } else {
          this.play();
        }
        return;
      }
      this.end();
      return;
    }

    var events = this.events[this.tick];

    events.forEach(function (e) {

      switch (e.type) {
        case eventType.tempo:
          var newInterval = Math.round(1000000 / (e.value * 0.8));
          if (newInterval !== this.interval) {
            this.interval = newInterval;
            this.timer.clearInterval();
            this.timer.setInterval(this.onTick, '', this.interval + 'u');
          }
          break;
        case eventType.controller:
          this.output.send(eventType.controller, {
            value: e.value,
            controller: e.controller,
            channel: e.channel
          });
          break;
        case eventType.pitchbend:
          this.output.send(eventType.pitchbend, {
            value: e.value,
            channel: e.channel
          });
          e.sent = true;

          break;
        case eventType.noteon:
          if (!this.fastForwarding || e.keyswitch) {
            this.output.send(eventType.noteon, {
              note: e.pitch.value,
              velocity: e.velocity || 80,
              channel: e.channel
            });
          }
          break;
        case eventType.noteoff:
          if (!this.fastForwarding || e.keyswitch) {
            this.output.send(eventType.noteoff, {
              note: e.pitch.value,
              channel: e.channel
            });
          }
          break;
        default:
          throw 'Unknown event type: ' + e.type
          break
      }

    }.bind(this));

    if (!this.fastForwarding) {
      this.logger.log(this.tick, events);
    }

    this.tick++;

  }

}

module.exports = Sequencer;
