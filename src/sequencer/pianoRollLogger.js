var eventType = require('../interpreter/constants').eventType;
var colors = require('colors');
var pad = require('pad');

function Logger() {
  this.data = {};
}

Logger.prototype.log = function (tick, events) {

  events.filter(e => e.type === eventType.noteoff)
    .forEach(e => {
      delete this.data[e.pitch.value];
    });
  events.filter(e => e.type === eventType.noteon).forEach(e => {
    this.data[e.pitch.value] = parseInt(e.channel,10)+1;
  });

  if (tick % 12 !== 0) return;

  var beat = Math.floor(tick / 48);
  var showBeat = beat > 0 && (!this.lastBeat || beat !== this.lastBeat);
  this.lastBeat = beat;
  var log = pad(showBeat ? beat.toString() : '', 3).white;
  for (var i = 0; i < 128; i++) {
    var channel = this.data[i];
    if (channel) {
      switch (channel) {
        case 0:
          log += channel.toString().black.bgWhite;
          break;
        case 1:
          log += channel.toString().black.bgYellow;
          break;
        case 2:
          log += channel.toString().black.bgCyan;
          break;
        case 3:
          log += channel.toString().black.bgGreen;
          break;
        case 4:
          log += channel.toString().black.bgBlue;
          break;
        case 5:
          log += channel.toString().black.bgRed;
          break;
        case 5:
          log += channel.toString().black.bgMagenta;
          break;
        default:
          log += channel.toString().black.bgWhite;
          break;
      }
    } else {
      log += '.'.grey;
    }
  }

  console.log(log);
}

module.exports = Logger;