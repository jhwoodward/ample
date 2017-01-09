var easymidi = require('easymidi');
var output = new easymidi.Output('IAC Driver Bus 1');
var colors = require("colors");
var pad = require('pad');


var api = {

  send: function (messages) {
    var tick = -1;
    var interval = 10;
    setTimeout(onTick, interval);

    var space = '                                                   ';

    var maxTick = messages.reduce(function(acc, message) {
      if (message.tick > acc) {
        return message.tick;
      } else {
        return acc;
      }
    },0);

    var indexed = {};
    for (var i = 0; i <= maxTick; i++) {
      indexed[i] = messages.filter(function (message) {
        return message.tick === i;
      });
    }

    function onTick() {
      tick++;

      if (tick ===0) {
        console.log('\n');
         console.log(space.bgGreen);
      }

      indexed[tick].forEach(function (message) {

        var log = '';
        var data = [];
        var color;

        var name = message.type;

        switch (message.type) {
          case 'noteon':

            data.push(message.char);
            data.push(`p${message.pitch}`);

            if (message.keyswitch) {
              name = 'keyswitch';
              color = colors.red;
            } else {
              color = colors.yellow;
              data.push(`v${message.velocity}`);
            }
           
          
           
          break;
          case 'noteoff':
           if (message.keyswitch) {
               name = 'ks off';
            }
            color = colors.grey;
             data.push(message.char);
            data.push(`p${message.pitch}`);
          break;
          case 'pitch':
            color = colors.red;
            data.push(message.value);
          break;
          case 'cc':
            color = colors.red;
            data.push(`cc${message.controller}`);
            data.push(`${message.value}`);
          break;

        }

        log += colors.green(pad(5,message.tick.toString())) + '  ';
        log += colors.green(pad((message.channel+1).toString(),3));
        log += color(pad(name,10)) + '  ';
        log += color(pad(data.join('  '),14));
        if (message.info) log += color(message.info) + '  ';
        console.log(log);
        
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

      if (tick < maxTick) {
        setTimeout(onTick, interval);
      } else {
         console.log(space.bgGreen);
      }


    }

  }
};
module.exports = api;
