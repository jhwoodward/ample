var eventType = require('../../../interpreter/constants').eventType;

function Logger(callback) {
  this.pitch = {};
  this.callback = callback;
  this.handler = this.handler.bind(this);
}

Logger.prototype.handler = function (event) {
  
  if (event.type !== 'tick') {
    this.callback(event);
    return;
  }

  var events = event.events;
  var tick = event.tick;
  this.tick = tick;

  events.filter(e => e.type === eventType.noteoff)
    .forEach(e => {
      delete this.pitch[e.pitch.value];
    });

  events.filter(e => e.type === eventType.noteon)
  .forEach(e => {
    this.pitch[e.pitch.value] = { 
      track: e.trackIndex + 1,
      channel: parseInt(e.channel, 10) + 1
    };
  });

  if (tick % 12 !== 0) return;

  this.beat = Math.floor(tick / 48);
  var showBeat = this.beat > 0 && (!this.lastBeat || this.beat !== this.lastBeat);
  this.callback({ 
    type: 'tick',
    beat: showBeat ? this.beat : undefined, 
    pitch: this.pitch 
  });
  this.lastBeat = this.beat;
}

module.exports = Logger;
