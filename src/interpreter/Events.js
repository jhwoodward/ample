var _ = require('lodash');

function midi(player, parsed) {

  var events = [], oninfo, offinfo;
  setDefaultExpression(player);
  parsed
    .filter(function(event){ return event.noteon || event.noteoff})
    .forEach(function (event, i) {
      event.next = i < parsed.length ? parsed[i + 1] : undefined;
      event.prev = i > 0 ? parsed[i - 1] : undefined;
      process(event);
    });


  return events;

  function process(event) {

    /*
       note.fittedToScale = note.pitchBeforeFit !== pitch;
       if (note.fittedToScale) {
         console.log(utils.noteFromMidiPitch(note.pitchBeforeFit) + '->' + utils.noteFromMidiPitch(pitch))
       }
       note.fittedRepeat = note.fittedToScale && lastNote && pitch === lastNote.pitch;
     */
    oninfo = {};
    offinfo = {};

    if (event.type === 'tempo') {
      setTempo(event.tick, event.tempo);
    }
   
    if (event.type === 'noteon') {
      event.on = event.tick;
      if (event.prev && event.prev.noteon) {
        event.prev.off = event.tick - 5; //default prev off before any adjustments - should come from default
      }
      setPhraseExpression(event);

      event.articulations.forEach(function (articulation) {
        setNoteExpression(event, articulation.expression);
      });

      setNoteOn(event, oninfo);
      if (event.prev && event.prev.noteon) {
        setNoteOff(
          event.prev,
          offinfo);
      }
    }

    if (event.noteoff && event.prev.noteon) {
      if (event.prev.staccato) {
        event.prev.off = event.tick - 10;
        offinfo = { for: 'staccato (end phrase)' };
      } else {
        event.prev.off = event.tick - 5; // should come from default
        offinfo = { for: 'default detach (end phrase)' };
      }
      setNoteOff(
        event.prev,
        offinfo);
    }
  }

  function setNoteExpression(event, exp) {

    var name = exp.name || 'inline';

    if (exp.on) {
      event.on = event.tick + exp.on;
      oninfo.on = { for: `${name} (${exp.on})`, note: true };
    }

    //not sure about this
    if (exp.off && event.prev && event.prev.noteon) {
      event.expression.note.off = exp.off;//set for reference
      var insidePhraseOff = true;//exp.off < 0 || (event.prev && event.prev.noteon && (event.prev.expression.note.off === exp.off));
      if (insidePhraseOff) {
        event.prev.off = event.tick + exp.off;
        offinfo= { for: `${name} (${exp.off})`, note: true };
      }
    }
    

    if (exp.keyswitch) {
      setKeyswitch(
        event.on - 1,
        exp.keyswitch,
        { for: name, note: true });
    }

    if (exp.velocity !== event.expression.phrase.velocity) {
      event.velocity = exp.velocity;
      oninfo.velocity = {for: name, note: true };

    }

    setPitchbend(
      event.on - 1,
      exp.pitchbend,
      { for: name, note: true });

    for (var key in exp.controller) {
      setCC(event.on-1,
        parseInt(key, 10),
        exp.controller[key],
        { for: name, note: true });
    }

  }


  function setPhraseExpression(event) {
    var exp = event.expression.phrase;
    var prevExp = event.prev && event.prev.noteon ? event.prev.expression.phrase : undefined;
    var name = exp.name;
    if (event.prev && event.prev.noteon) {
      if (prevExp && prevExp.off) {
        var insidePhraseOff = prevExp.off < 0 || prevExp.off === exp.off;
        if (insidePhraseOff) {
          event.prev.off = event.tick + prevExp.off;
          offinfo= {for:`${prevExp.name} (${prevExp.off})`, phrase: true };
        } else {
           event.prev.off = event.tick -5;//should be set in defaults
          offinfo= { for:`end phrase (default detach)`, phrase: true };
        }
      }

      if (prevExp.name.indexOf('staccato') === 0) {
        event.prev.off = event.prev.tick + ((event.tick - event.prev.tick) / 2);
        offinfo = { for: 'staccato (half)', phrase:true };
      }
    }

    if (exp.on) {
      var insidePhraseOn = prevExp && prevExp.on === exp.on;
      if (insidePhraseOn) {
        event.on = event.tick + exp.on;
        oninfo.on = {for: `${name} (${exp.on})`, phrase: true };
      }
    }

    setKeyswitch(
      event.on - 1,
      exp.keyswitch,
      { for: name, phrase: true });

    event.velocity = exp.velocity;
    oninfo.velocity = { for: `${name} (${exp.velocity})`, phrase: true };

    setPitchbend(
      event.on - 1,
      exp.pitchbend,
      { for: name, phrase: true });

    for (var key in exp.controller) {
      setCC(event.on,
        parseInt(key, 10),
        exp.controller[key],
        { for: name, phrase: true });
    }

  }

  function setDefaultExpression(player) {

    var phrase = _.merge({}, player.annotations.default.expression);
    var info = { for:'default', phrase:true };
    setPitchbend(0, phrase.pitchbend, info);
    if (phrase.keyswitch) {
      setKeyswitch(0, phrase.keyswitch, info);
    }
    for (var key in phrase.controller) {
      setCC(0, parseInt(key, 10), phrase.controller[key], info);
    }
    return phrase;
  }

  function setNoteOn(event, info) {
   
   var arrInfo = [];
   for (var key in info) {
     arrInfo.push(`${key}: ${info[key].for}`);
   }

    events.push({
      type: 'noteon',
      pitch: event.pitch.value,
      velocity: event.velocity,
      tick: event.on,
      channel: player.channel,
      char: event.pitch.char,
      info: arrInfo.join(', ')
    });
  }

  function setNoteOff(event, info) {
  
    events.push({
      type: 'noteoff',
      pitch: event.pitch.value,
      tick: event.off,
      channel: player.channel,
      char: event.pitch.char,
      duration: event.off - event.on,
      info: info.for
    });
  }

  function setTempo(tick, tempo) {
    events.push({
      type: 'tempo',
      tick: tick,
      tempo: tempo
    });
  }



  function setCC(tick, number, value, info) {

    var lastValue = events.filter(function (m) {
      return m.channel === player.channel &&
        m.controller === number &&
        m.type === 'cc';
    }).reduce(function (acc, item) {
      if (item.tick > acc.tick && item.tick <= tick) {
        return item;
      } else {
        return acc;
      }
    }, { tick: -1 }).value;

    if (value === lastValue) return;

    events.push({
      type: 'cc',
      controller: number,
      value: value,
      tick: tick,
      channel: player.channel,
      info: info.for
    });


  }

  function setPitchbend(tick, value, info) {

    var lastValue = events.filter(function (m) {
      return m.channel === player.channel &&
        m.type === 'pitch';
    }).reduce(function (acc, item) {
      if (item.tick > acc.tick && item.tick <= tick) {
        return item;
      } else {
        return acc;
      }
    }, { tick: -1 }).value;

    if (value === lastValue) return;

    events.push({
      type: 'pitch',
      value: value,
      tick: tick,
      channel: player.channel,
      info: info.for
    });

  }

  function setKeyswitch(tick, ks, info) {

    if (!ks) return;
    var pitch = ks.pitch;
    var char = ks.char;

    var lastValue = events.filter(function (m) {
      return m.channel === player.channel &&
        m.type === 'noteon' &&
        m.keyswitch;
    }).reduce(function (acc, item) {
      if (item.tick > acc.tick && item.tick <= tick) {
        return item;
      } else {
        return acc;
      }
    }, { tick: -1 }).pitch;

    if (pitch === lastValue) return;

    events.push({
      type: 'noteon',
      pitch: pitch,
      velocity: 64,
      tick: tick,
      channel: player.channel,
      info: info.for,
      char,
      keyswitch: true
    });
    events.push({
      type: 'noteoff',
      pitch: pitch,
      tick: tick + 1,
      channel: player.channel,
      info: info.for,
      char,
      duration: 1,
      keyswitch: true
    });
  }
}
module.exports = midi;