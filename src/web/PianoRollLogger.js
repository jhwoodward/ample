var eventType = require('../interpreter/constants').eventType;

function Logger(onLog) {
  this.pitch = {};
  this.onLog = onLog;
}

Logger.prototype.logEvent = function (e) {
  this.onLog(e);
}

Logger.prototype.log = function (tick, events) {
  this.tick = tick;
  events.filter(e => e.type === eventType.noteoff)
    .forEach(e => {
      delete this.pitch[e.pitch.value];
    });
  events.filter(e => e.type === eventType.noteon)
  .forEach(e => {
    this.pitch[e.pitch.value] = parseInt(e.channel, 10) + 1;
  });

  if (tick % 12 !== 0) return;

  this.beat = Math.floor(tick / 48);
  var showBeat = this.beat > 0 && (!this.lastBeat || this.beat !== this.lastBeat);
  this.onLog({ 
    type: 'pitch',
    beat: showBeat ? this.beat : undefined, 
    pitch: this.pitch 
  });
  this.lastBeat = this.beat;
}






module.exports = Logger;