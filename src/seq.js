var easymidi = require('easymidi');
var output = new easymidi.Output('IAC Driver Bus 1');
var colors = require("colors");


var api = {

  send: function (messages) {
    var tickCount = -1;
    var interval = setInterval(onTick, 10);

    function onTick() {
      tickCount++;
      var tickMessages = messages.filter(function (message) {
        return message.tick === tickCount;
      });
      tickMessages.forEach(function (message) {
        console.log(`${colors.magenta(message.tick)}  ${message.type==='noteon' ? colors.yellow(message.type) : colors.cyan(message.type)}  p-${message.pitch}  ${message.velocity? 'v-' + message.velocity:''}`.yellow);
        if (!message.sent) {
          output.send(message.type, {
            value: message.value,
            controller: message.controller,
            note: message.pitch,
            velocity: message.velocity,
            channel: message.channel
          });
          message.sent = true;
        }

      });
    }

  }
};
module.exports = api;
