var easymidi = require('easymidi');
var output = new easymidi.Output('IAC Driver Bus 1');
var colors = require("colors");
var pad = require('pad');


var api = {

  send: function (events) {
    var tick = -1;
    var interval = 10;
    setTimeout(onTick, interval);

    var space = '                                                   ';

    var maxTick = events.reduce(function(acc, event) {
      if (event.tick > acc) {
        return event.tick;
      } else {
        return acc;
      }
    },0);

    var indexed = {};
    for (var i = 0; i <= maxTick; i++) {
      indexed[i] = events.filter(function (event) {
        return event.tick === i;
      });
    }

    function onTick() {
      tick++;

      if (tick ===0) {
        console.log('\n');
         console.log(space.bgGreen);
      }

      indexed[tick].forEach(function (event) {

        var log = '';
        var data = [];
        var color;

        var name = event.type;

        switch (event.type) {
          case 'noteon':

            data.push(event.char);
            data.push(`p${event.pitch}`);

            if (event.keyswitch) {
              name = 'keyswitch';
              color = colors.red;
            } else {
              color = colors.yellow;
              data.push(`v${event.velocity}`);
            }
           
          
           
          break;
          case 'noteoff':
           if (event.keyswitch) {
               name = 'ks off';
            }
            color = colors.grey;
            data.push(event.char);
            data.push(`p${event.pitch}`);
            data.push(`dur${event.duration}`);
          break;
          case 'pitch':
            color = colors.red;
            data.push(event.value);
          break;
          case 'cc':
            color = colors.red;
            data.push(`cc${event.controller}`);
            data.push(`${event.value}`);
          break;

        }

        log += colors.green(pad(5,event.tick.toString())) + '  ';
        log += colors.green(pad((event.channel+1).toString(),3));
        log += color(pad(name,10)) + '  ';
        log += color(pad(data.join('  '),15));
        if (event.info) log += color(event.info) + '  ';
        console.log(log);
        
        if (!event.sent) {
          output.send(event.type, {
            value: event.value,
            controller: event.controller,
            note: event.pitch,
            velocity: event.velocity,
            channel: event.channel
          });
          event.sent = true;
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
