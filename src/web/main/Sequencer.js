var eventType = require('../../interpreter/constants').eventType;
var utils = require('../../interpreter/utils');
var Interpreter = require('../../interpreter/Interpreter');
var webmidi = require('webmidi');

function Sequencer() {
  this.stopped = false;
  this.paused = false;
  this.interval = 10;
  this.tick = -1;
  this.onTick = this.onTick.bind(this);
  this.listeners = [];
}

function prepPlayers(players) {
  for (var key in players) {
    var player = players[key];
    if (player.annotations && player.annotations.name) {
      delete player.annotations.name;
    }
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
  init: function (cb) {
    webmidi.enable(function (err) {
      console.log(webmidi.inputs);
      console.log(webmidi.outputs);
      this.output = webmidi.outputs[0];
      cb(this.output);
    }.bind(this));
  },
  subscribe: function(listener) {
    this.listeners.push(listener);
  },
  raiseEvent: function(e) {
    this.listeners.forEach(function(listener) {
      listener(e);
    });
  },
  load: function (players) {
    players = prepPlayers(players);
    var player1 = players[Object.keys(players)[1]];
    var master = new Interpreter(player1.macros, player1.master).master;
    this.markers = getMarkers(master);
    var events = [];
    var interpreter;
    for (var key in players) {
      console.log('Interpreting ' + key);
      interpreter = new Interpreter(players[key].macros, players[key].master);
      players[key].interpreted = interpreter.interpret(players[key].part);
      players[key].interpreted.events.forEach(e => { 
        e.channel = players[key].channel;
        e.track = key; 
      });
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
    return this;
  },
  start: function (options) {
    this.allNotesOff();
    options = options || {};

    if (!this.events) {
      throw (new Error('No players loaded'));
    }

    window.clearInterval(this.timer);

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
      if (!marker.length) throw (new Error('Marker not found: ' + markerName));
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

    if (this.startTick > 0) {
      this.fastForward();
    } else {
      this.play();
    }
  },
  play: function () {
    this.raiseEvent({ type: 'start' });
    this.timer = window.setInterval(this.onTick, this.interval);
  },
  fastForward: function () {
    this.ffendTick = this.endTick;
    this.endTick = this.startTick - 1;
    this.fastForwarding = true;
    this.timer = windows.setInterval(this.onTick, 1);
  },
  onFastForwardCompleted: function () {
    window.clearInterval(this.timer);
    this.endTick = this.ffendTick;
    this.fastForwarding = false;
    this.play();
  },
  allNotesOff: function () {
    for (var i = 0; i < 3; i++) {
      for (var c = 0; c < 16; c++) {
        for (var p = 0; p < 128; p++) {
          this.output.stopNote(p, c + 1);
        }
      }
    }
  },
  switchOffAllTheShit: function () {
    window.clearInterval(this.timer);
    this.stopped = true;
    this.allNotesOff();
  },
  stop: function () {
    this.switchOffAllTheShit();
    this.raiseEvent({type: 'stop'});
  },
  end: function () {
    this.switchOffAllTheShit();
    this.raiseEvent({type: 'end'});
  },
  togglePause: function () {
    this.paused = !this.paused;
    if (this.paused) {
      window.clearInterval(this.timer);
      this.allNotesOff();
      this.raiseEvent({type: 'pause'});
    } else {
      this.timer = window.setInterval(this.onTick, this.interval);
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
        window.clearInterval(this.timer);
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
          var newInterval = Math.round(1000 / (e.value * 0.8));
          if (newInterval !== this.interval) {
            this.interval = newInterval;
            window.clearInterval(this.timer);
            this.timer = windows.setInterval(this.onTick, this.interval);
          }
          break;
        case eventType.controller:
          this.output.sendControlChange(e.controller, e.value, e.channel + 1);
          break;
        case eventType.pitchbend:
          var val = (e.value - 8192) / 8192;
          this.output.sendPitchBend(val, e.channel + 1); //value needs to be between -1 and 1 for webmidi
          break;
        case eventType.noteon:
          if (!this.fastForwarding || e.keyswitch) {
            this.output.playNote(e.pitch.value, e.channel + 1, 
            { 
              rawVelocity: true, 
              velocity: e.velocity || 80 
            });
          }
          break;
        case eventType.noteoff:
          if (!this.fastForwarding || e.keyswitch) {
            this.output.stopNote(e.pitch.value, e.channel + 1);
          }
          break;
        default:
          throw 'Unknown event type: ' + e.type
          break
      }

    }.bind(this));

    if (!this.fastForwarding) {

      this.markers.forEach(m => {
        if (this.tick >= m.tick && !m.logged) {
          this.raiseEvent({
            type: 'marker',
            value: m.key
          });
          m.logged = true;
        }
      });

      this.raiseEvent({ 
        type: 'tick', 
        tick: this.tick, 
        events: events 
      });
    }

    this.tick++;

  }

}

module.exports = Sequencer;
