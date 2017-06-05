var eventType = require('../../interpreter/constants').eventType;

function Logger(onLog) {

  this.onLog = onLog;
  this.logEvent = this.logEvent.bind(this);
  this.columns = {
    tick: {
      value: function (e) {
        return e.tick;
      }
    },
    beat: {
      value: function (e) {
        return this.beat;
      }
    },
    channel: {
      value: function (e) {
        if (e.channel === undefined) return undefined;
        return e.channel + 1;
      }
    },
    type: {
      value: function (e) {
        if (e.keyswitch) {
          return 'keyswitch';
        }
        if (e.type === eventType.controller) {
          return e.type + ' ' + e.controller;
        }
        return e.type;
      }
    },
    value1: {
      value: function (e) {
        if (e.pitch) {
          return (e.pitch.string + ' (' + e.pitch.value + ')');
        }
        if (e.value !== undefined) {
          return e.value;
        }
      }
    },
    value2: {
      value: function (e) {
        switch (e.type) {
          case eventType.noteon:
            if (!e.keyswitch && e.offset) {
              return e.offset;
            }
            break;
          case eventType.noteoff:
            if (!e.keyswitch && e.offset) {
              return e.offset;
            }
            break;
        }
      }
    },
    value3: {
      value: function (e) {
        switch (e.type) {
          case eventType.noteon:
            if (!e.keyswitch) {
              var v = `v${e.velocity}`;
              return v;
            }
            break;
          case eventType.noteoff:
            var d = `d${e.duration}`;
            return d
            break;
        }
      }
    },
    articulation: {
      value: function (e) {
        return e.articulation;
      }
    },
    phrase: {
      value: function (e) {
        return e.annotation;
      }
    },
    modifiers: {
      value: function (e) {
        return e.modifiers;
      }
    },
    marker: {
      value: function (e) {
        return e.marker;
      }
    }
  };
}

Logger.prototype.log = function (tick, events) {
  this.tick = tick;
  this.beat = Math.floor(tick / 48);
  events.forEach(this.logEvent);
  this.lastBeat = this.beat;
}

Logger.prototype.logEvent = function (e) {
  var data = [];
  if (e.type === 'noteoff' && e.keyswitch) return;
  for (var key in this.columns) {
    var c = this.columns[key];
    var value = c.value(e);
    data.push(value);
  }
  this.onLog({ type: e.type, data });
}

module.exports = Logger;
