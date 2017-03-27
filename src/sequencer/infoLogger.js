var eventType = require('../interpreter/constants').eventType;
var colors = require('colors');
var eventType = require('../interpreter/constants').eventType;
var pad = require('pad');

function eventTypeColor(e) {
  switch (e.type) {
    case eventType.noteon:
      if (e.keyswitch) {
        return colors.red;
      } else {
        return colors.yellow;
      }
      break;
    case eventType.noteoff:
      return colors.grey;
      break;
    case eventType.pitchbend:
      return colors.magenta;
      break;
    case eventType.controller:
      return colors.magenta;
      break;
    case eventType.tempo:
      return colors.blue;
      break;
    default:
      return colors.grey;
  }
}

function Logger() {
  this.logEvent = this.logEvent.bind(this);
  console.log('/n/n');
  this.columns = {
    tick: {
      align: 'left',
      width: 5,
      color: function () {
        if (this.lastBeat !== this.beat) {
          return colors.white;
        } else {
          return colors.gray;
        }
      },
      value: function (e) {
        return e.tick;
      }
    },
    beat: {
      width: 5,
      color: function () {
        if (this.lastBeat !== this.beat) {
          return colors.white;
        } else {
          return colors.gray;
        }
      },
      value: function (e) {
        return Math.floor(e.tick / 48);
      }
    },
    channel: {
      width: 3,
      color: colors.blue,
      value: function (e) {
        return e.channel + 1;
      }
    },
    name: {
      align: 'left',
      width: 10,
      color: eventTypeColor,
      value: function (e) {
        if (e.keyswitch) {
          return e.type + ' ks';
        }
        if (e.type === eventType.controller) {
          return e.type + ' ' + e.controller;
        }
        return e.type;
      }
    },
    value1: {
      width: 10,
      color: eventTypeColor,
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
      width: 5,
      color: eventTypeColor,
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
      width: 5,
      color: eventTypeColor,
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
      align: 'left',
      width: 20,
      color: eventTypeColor,
      value: function (e) {
        if (e.articulation !== 'default') {
          return e.articulation;
        }

      }
    },
    phrase: {
      align: 'left',
      width: 25,
      color: eventTypeColor,
      value: function (e) {
        return e.annotation;
      }
    },

    modifiers: {
      align: 'left',
      width: 20,
      color: colors.green,
      value: function (e) {
        return e.modifiers;
      }
    },
    marker: {
      align: 'left',
      width: 10,
      color: eventTypeColor,
      value: function (e) {
        return e.marker;
      }
    }
  };
}


Logger.prototype.log = function (tick, events) {

  this.beat = Math.floor(tick / 48);
  events.forEach(this.logEvent);
  this.lastBeat = this.beat;
}

Logger.prototype.logEvent = function (e) {
  var log = '';
  for (var key in this.columns) {
    var c = this.columns[key]
    var color;
    var value = c.value(e);
    if (c.color.name === 'builder') {
      color = c.color;
    } else {
      color = c.color.call(this, e, value);
    }
    if (value === undefined) {
      if (c.align === 'left') { log += '  '; }
      log += pad('', c.width);
      continue;
    }
    if (c.align === 'left') {
      log += '  ' + color(pad(value.toString().trim(), c.width));
    } else {
      log += color(pad(c.width, value.toString().trim()));
    }

  }
  console.log(log);
}


module.exports = Logger;
