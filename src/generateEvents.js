var _ = require('lodash');

function generateEvents(player, parsed) {

  var events = [];
  setDefaultExpression(player);

  parsed.forEach(function (event, i) {
    event.next = i < parsed.length ? parsed[i + 1] : undefined;
    event.prev = i > 0 ? parsed[i - 1] : undefined;
    /*
    note.fittedToScale = note.pitchBeforeFit !== note.pitch;
    if (note.fittedToScale) {
      console.log(utils.noteFromMidiPitch(note.pitchBeforeFit) + '->' + utils.noteFromMidiPitch(note.pitch))
    }
    note.fittedRepeat = note.fittedToScale && lastNote && note.pitch === lastNote.pitch;
  */
    oninfo = [], offinfo = [];

    if (event.noteon) {
      event.on = event.time.tick;
      if (event.prev && event.prev.noteon) {
        event.prev.off = event.time.tick; //default prev off before any adjustments
      }
      setPhraseExpression(event);

      event.expression.note.articulations.forEach(function (articulation) {
        setNoteExpression(event, articulation.expression);
      });

      // setNoteExpressions(event.expression.note, 'inline');
      setNoteOn(event, oninfo);

      if (event.prev && event.prev.noteon) {
        setNoteOff(
          event.prev,
          offinfo);
      }
    }

    if (event.noteoff && event.prev.noteon) {
      if (event.prev.staccato) {
        event.prev.off = event.time.tick - 10;
        offinfo.push({ off: true, for: 'staccato' });
      } else {
        event.prev.off = event.time.tick; // default slightly detached
        offinfo.push({ off: true, for: 'full' });
      }
      setNoteOff(
        event.prev,
        offinfo);
    }
  });

  return events;

  function setNoteExpression(event, exp) {

    var name = exp.name;

    if (exp.on) {
      event.on = event.time.tick + exp.on;
      oninfo.push({ for: `${name} (${exp.on})`, note: true });
    }

    //not sure about this
    if (exp.off && event.prev && event.prev.noteon) {
      event.expression.note.off = exp.off;//set for reference
      var insidePhraseOff = exp.off < 0 || (event.prev && event.prev.noteon && (event.prev.expression.note.off === exp.off));
      if (insidePhraseOff) {
        event.prev.off = event.time.tick + exp.off;
        offinfo.push({ for: `${name} (${exp.off})`, note: true });
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
      oninfo.push({ velocity: true, for: name, note: true });

    }

    setPitchbend(
      event.on - 1,
      exp.pitchbend,
      { for: name, note: true });

    for (var key in exp.controller) {
      setCC(event.on - 1,
        parseInt(key, 10),
        exp.controller[key],
        { for: name, note: true });
    }

  }


  function setPhraseExpression(event) {
    var exp = event.expression.phrase;
    var prevExp = event.prev && event.prev.noteon ? event.prev.expression.phrase: undefined;
    var prevPrevExp = prevExp && event.prev.prev && event.prev.prev.noteon ? event.prev.prev.expression.phrase: undefined
    var name = exp.name;
    if (event.prev && event.prev.noteon) {
      if (event.prev.expression.phrase.off) {
        var insidePhraseOff = prevExp.off < 0 || (prevPrevExp && prevPrevExp.off === prevExp.off);//last notes of staccato phrase arent picked up
        if (insidePhraseOff) {
          event.prev.off = event.time.tick + prevExp.off;
          offinfo.push({ for: `${prevExp.name} (${exp.off})`, note: true });
        }
      }

      if (prevExp.name.indexOf('staccato') === 0) { //last notes of staccato phrase arent picked up
        event.prev.off = event.prev.time.tick + ((event.time.tick - event.prev.time.tick) / 2);
        offinfo.push({ for: 'staccato (half)' });
      }

    }

    if (exp.on) {
      var insidePhraseOn = player.config.alwaysAffectOn || (prevExp && prevExp.on === exp.on);
      if (insidePhraseOn) {
        event.on = event.time.tick + exp.on;
        oninfo.push({ on: true, for: `${name} (${exp.on})`, phrase: true });
      }
    }

    setKeyswitch(
      event.on - 1,
      exp.keyswitch,
      { for: name, phrase: true });

    event.velocity = exp.velocity;
    oninfo.push({ velocity: true, for: `${name} (${exp.velocity})`, phrase: true });

    setPitchbend(
      event.on - 1,
      exp.pitchbend,
      { for: name, phrase: true });

    for (var key in exp.controller) {
      setCC(event.on - 2,//needs to be before anything caused by a note articulation so that it resets correctly
        parseInt(key, 10),
        exp.controller[key],
        { for: name, phrase: true });
    }

  }

  function setDefaultExpression(player) {

    var phrase = _.merge({}, player.config.defaultExpression);
    var info = 'default';

    setPitchbend(0, phrase.pitchbend, info);

    if (phrase.keyswitch) {
      setKeyswitch(0, phrase.keyswitch, info);
    }

    setCC(0, 1, phrase.dynamics, info);

    for (var key in phrase.controller) {
      setCC(0, parseInt(key, 10), phrase.controller[key], info);
    }

    return phrase;
  }

  function setNoteOn(event, info) {
    info = info.map(function (item) { return item.for; });
    info = info.length > 1 ? info.join(', ') : info.length === 1 ? info[0] : ''

    events.push({
      type: 'noteon',
      pitch: event.pitch.value,
      velocity: event.velocity,
      tick: event.on,
      channel: player.channel,
      char: event.pitch.char,
      info: info
    });
  }

  function setNoteOff(event, info) {
    info = info.map(function (item) { return item.for; });
    info = info.length > 1 ? info.join(', ') : info.length === 1 ? info[0] : ''

    events.push({
      type: 'noteoff',
      pitch: event.pitch.value,
      tick: event.off,
      channel: player.channel,
      char: event.pitch.char,
      duration: event.off - event.on,
      info: info
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

    console.log('set cc' + number + ' to ' + value, lastValue);

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
module.exports = generateEvents;