var eventType = require('../../interpreter/constants').eventType;
var utils = require('../../interpreter/utils');
var Interpreter = require('../../interpreter/Interpreter');
require('./WAAClock');

function Sequencer(output) {

  this.stopped = false;
  this.paused = false;
  this.interval = 1;
  this.tick = -1;
  this.onTick = this.onTick.bind(this);
  this.output = output;
  this.listeners = [];
  this.muted = [];
  this.noteState = {}; //index by track of noteons so that noteoffs can be raised when track is muted

}




Sequencer.prototype = {
  subscribe: function (listener) {
    this.listeners.push(listener);
  },
  raiseEvent: function (e) {
    this.listeners.forEach(function (listener) {
      listener(e);
    });
  },
  preptrack: function (track) {
    if (track.annotations && track.annotations.name) {
      delete track.annotations.name;
    }
    track.macros = utils.combineMacros(track);
  },
  interpret: function (track) {
    this.raiseEvent({ type: 'info', info: 'Interpreting ' + track.key })
    var interpreter = new Interpreter(track.macros, this.interpretedMaster || this.master.part);
    var interpreted = interpreter.interpret(track.part);
    interpreted.events.forEach(e => {
      e.track = track;
    });
    return interpreted;
  },
  reorder: function (tracks) {
    if (tracks) {
      this.tracks = tracks;
    }
    var interpreted = [];
    this.tracks.forEach((track, i) => {
      var index = track.originalIndex === undefined ? i : track.originalIndex;
      if (!this.interpreted[index]) return;
      interpreted[i] = this.interpreted[index];
      interpreted[i].events.forEach(e => {
        e.trackIndex = i;
      });
      track.originalIndex = i;
    });
    this.interpreted = interpreted;
    this.raiseEvent({ type: 'ready', tracks: this.tracks, interpreted: this.interpreted })
  },
  updateMaster: function (master) {

    this.master = master;

    var interpreted = new Interpreter(master.macros, master.part).master;
    if (interpreted.states.length) {
      this.markers = interpreted.markerArray;
      var endTick = interpreted.states[interpreted.states.length - 1].tick;
      this.raiseEvent({ type: 'markers', markers: this.markers, end: endTick });
    }
    interpreted.events.forEach(e => {
      e.track = master;
      e.isMaster = true;
    });
    this.interpretedMaster = interpreted;

    if (this.tracks) {
      return this.interpretAll();
    }
    return this;

  },
  update: function (updatedTrack) {
    if (!this.tracks) return;
    this.preptrack(updatedTrack);
    var events = [];
    this.tracks.forEach((track, i) => {
      if (track.key === updatedTrack.key) {
        track = updatedTrack;
        this.tracks[i] = updatedTrack;
        this.interpreted[i] = this.interpret(updatedTrack);
      }
      events = events.concat(this.interpreted[i].events);
    });

    this.validate(events);
    this.index(events);
    this.reorder();
    this.raiseEvent({ type: 'ready', tracks: this.tracks, interpreted: this.interpreted })
    return this;
  },
  validate: function (events) {
    var errors = events.filter(e => {
      return e.tick === undefined || isNaN(e.tick);
    });
    if (errors.length) {
      throw (new Error('Missing tick', errors.length));
    }
  },
  index: function (events) {
    if (!events.length) return;
    this.raiseEvent({ type: 'info', info: 'indexing...' })
    events.sort(function (a, b) {
      if (a.tick === b.tick) return 0;
      return a.tick > b.tick ? 1 : -1;
    });
    this.maxTick = events[events.length - 1].tick;
    this.events = {};
    for (var i = 0; i <= this.maxTick; i++) {
      this.events[i] = events.filter(function (e) {
        return e.tick === i;
      });
    }
  },
  interpretAll: function () {

    var events = this.interpretedMaster.events;
    this.tracks.forEach((track, i) => {
      this.interpreted[i] = this.interpret(track);
      events = events.concat(this.interpreted[i].events);
    });
    this.validate(events);

    var masterEvents = events.filter(e=>e.isMaster);

    this.index(events);
    this.reorder();
    this.raiseEvent({ type: 'ready', interpreted: this.interpreted, tracks: this.tracks })
    return this;

  },
  load: function (tracks, master) {
    this.interpreted = [];
    this.tracks = tracks;
    this.tracks.forEach(this.preptrack.bind(this));
    return this.updateMaster(master);

  },
  start: function (options) {
    //  this.allNotesOff();
    options = options || {};
    if (!this.events) {
      throw (new Error('No tracks loaded'));
    }
    this.startTick = 0;
    this.endTick = this.maxTick;
    this.loop = false;//options.loop;

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
      this.raiseEvent({ type: 'start' });
      this.play();
    }
  },
  toggleMute: function (track) {
    var mutedIndex = this.muted.indexOf(track.key);
    if (mutedIndex > -1) {
      track.isMuted = false;
      this.muted.splice(mutedIndex);
    } else {
      track.isMuted = true;
      this.muted.push(track.key);
      for (var key in this.noteState[track.key]) {
        this.output.stopNote(key, track.channel + 1);
        delete this.noteState[track.key][key];
      }
    }
    track.hidden = track.isMuted;
    this.raiseEvent({ type: 'mute', interpreted: this.interpreted, tracks: this.tracks });
  },
  isNotSolo: function(track) {
    return this.solo && this.solo !== track.key;
  },
  toggleSolo: function (track) {
    if (this.solo === track.key) {
      this.solo = undefined;
    } else {
      this.solo = track.key;
      this.tracks.forEach(t => {
        if (t.key !== this.solo) {
          for (var key in this.noteState[t.key]) {
            this.output.stopNote(key, t.channel + 1);
            delete this.noteState[track.key][key];
          }
        }
      });
    }
    this.raiseEvent({ type: 'solo', interpreted: this.interpreted, tracks: this.tracks });
  },
  play: function () {
    this.stop();
    if (this.context) {
      this.context.close();
    }
    this.context = new AudioContext();
    this.clock = new WAAClock(this.context);
    this.clock.start();
    this.playing = true;
    this.stopped = false;

    this.scheduled = this.clock.callbackAtTime(this.onTick, 0.01)
      .repeat(0.01)
      .tolerance({ late: 50 })

  },
  fastForward: function () {
    this.ffendTick = this.endTick;
    this.endTick = this.startTick - 1;
    this.fastForwarding = true;
    this.timer = window.setInterval(this.onTick, 1);
  },
  onFastForwardCompleted: function () {
    //window.clearInterval(this.timer);
    this.endTick = this.ffendTick;
    this.fastForwarding = false;
    this.play();
  },
  allNotesOff: function () {
    for (var i = 0; i < 3; i++) {
      for (var c = 0; c < 16; c++) {
        for (var p = 0; p < 128; p++) {
          this.output.stopNote(p, c + 1);
          //   this.raiseEvent({ type: 'noteoff', pitch: { value: p } })
        }
      }
    }
  },
  stop: function () {
    //  if (!this.playing) return;
    this.stopped = true;
    // this.allNotesOff();
    this.raiseEvent({ type: 'stop' });
    this.playing = false;
    if (this.clock) {
      this.clock.stop();
    }

  },
  end: function () {
    this.stopped = true;
    // this.allNotesOff();
    this.raiseEvent({ type: 'end' });
  },
  togglePause: function () {
    this.paused = !this.paused;
    this.playing = !this.paused;
    if (this.paused) {
      this.clock.stop();
      this.allNotesOff();
      this.raiseEvent({ type: 'pause' });
    } else {
      this.play();
      this.raiseEvent({ type: 'continue' });

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
      } else {
        this.end();
        return;
      }
     
     
    }

    var events;
    if (this.solo) {
      events = this.events[this.tick].filter(e => e.track.key === this.solo || e.isMaster);
    } else {
      events = this.events[this.tick].filter(e => this.muted.indexOf(e.track.key) === -1  || e.isMaster);
    }

    events.forEach(function (e) {

      switch (e.type) {
        case eventType.tempo:
          var newInterval = Math.round(1000 / (e.value * 0.8));
          if (newInterval !== this.interval) {
            this.interval = newInterval;
            window.clearTimeout(this.timer);
            this.timer = window.setTimeout(this.onTick, this.interval);
            // window.clearInterval(this.timer);
            //this.timer = windows.setInterval(this.onTick, this.interval);
          }
          break;
        case eventType.controller:
          this.output.sendControlChange(e.controller, e.value, e.track.channel + 1);
          break;
        case eventType.pitchbend:
          var val = (e.value - 8192) / 8192;
          this.output.sendPitchBend(val, e.track.channel + 1); //value needs to be between -1 and 1 for webmidi
          break;
        case eventType.noteon:
          if (!this.fastForwarding || e.keyswitch) {
            this.output.playNote(e.pitch.value, e.track.channel + 1,
              {
                rawVelocity: true,
                velocity: e.velocity || 80
              });
            this.noteState[e.track] = this.noteState[e.track] || {};
            this.noteState[e.track][e.pitch.value] = 1;
          }
          this.raiseEvent(e);
          break;
        case eventType.noteoff:
          if (!this.fastForwarding || e.keyswitch) {
            this.output.stopNote(e.pitch.value, e.track.channel + 1);
            delete this.noteState[e.track][e.pitch.value];
          }
          this.raiseEvent(e);
          break;
        case eventType.substitution:
          //
          break;
        default:
          //  throw 'Unknown event type: ' + e.type
          break
      }

    }.bind(this));

    if (!this.fastForwarding) {

      this.raiseEvent({
        type: 'tick',
        tick: this.tick,
        events: events
      });

    }
    this.tick++;

  },
  trigger: function (e) {

    switch (e.type) {
      case eventType.noteon:
        this.output.playNote(e.pitch.value, e.track.channel + 1,
          {
            rawVelocity: true,
            velocity: e.velocity || 80
          });
        break;
      case eventType.noteoff:
        this.output.stopNote(e.pitch.value, e.track.channel + 1);
        break;
    }

    this.raiseEvent({
      type: 'tick',
      tick: 0,
      events: [e]
    });

  }

}

module.exports = Sequencer;
