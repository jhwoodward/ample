var _ = require('lodash');

function generateEvents(player, parsed) {

  var events = [];
  setDefaultExpression(player);

  parsed.forEach(function (event, i) {

    var next = i < parsed.length ? parsed[i + 1] : undefined;
    var prev = i > 0 ? parsed[i - 1] : undefined;
    var info = [];
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
   
      var pExp = event.expression.phrase;
      var pName = event.expression.phrase.name;
      var nExp = event.expression.note;//not yet impleneted - everything is thorugh artiulations currnetly

      if (prev && prev.noteon) {

        event.prev = prev;

        prev.off = event.time.tick;
/*
        if (pExp.off) {
          var insidePhraseOff = pExp.off < 0 || (prev && prev.noteon && (prev.expression.note.off === pExp.off));//last notes of staccato phrase arent picked up
          if (insidePhraseOff) {
            prev.off = event.time.tick + pExp.off;
            offinfo.push({ for: `${pName} (${pExp.off})`, note: true });
          }
        }
*/
        if (prev.expression.phrase.off) {
          var insidePhraseOff = prev.expression.phrase.off < 0 || (prev.prev && prev.prev.noteon && (prev.prev.expression.note.off === prev.expression.phrase.off));//last notes of staccato phrase arent picked up
          if (insidePhraseOff) {
            prev.off = event.time.tick + prev.expression.phrase.off;
            offinfo.push({ for: `${prev.expression.phrase.name} (${pExp.off})`, note: true });
          }
        }

        if (prev.expression.phrase.name.indexOf('staccato') === 0) { //last notes of staccato phrase arent picked up
          prev.off = prev.time.tick + ((event.time.tick - prev.time.tick) / 2);
          offinfo.push({ for: 'staccato (half)' });
        }

      }



      if (pExp.on) {
        var insidePhraseOn = player.config.alwaysAffectOn || prev && prev.noteon && (prev.expression.phrase.on === pExp.on);
        if (insidePhraseOn) {
          event.on = event.time.tick + pExp.on;
          oninfo.push({ on: true, for: `${pName} (${pExp.on})`, phrase: true });
        }
      }



      setKeyswitch(
        event.on - 1,
        pExp.keyswitch,
        { for: pName, phrase: true });

      event.velocity = pExp.velocity;
      oninfo.push({ velocity: true, for: `${pName} (${pExp.velocity})`, phrase: true });

      setPitchbend(
        event.on - 1,
        pExp.pitchbend,
        { for: pName, phrase: true });

      for (var key in pExp.controller) {
        setCC(event.on - 1,
          parseInt(key, 10),
          pExp.controller[key],
          { for: pName, phrase: true });
      }

      event.expression.note.articulations.forEach(function (articulation) {

        var aExp = articulation.expression;
        var aName = articulation.name;

        if (aExp.on) {
          event.on = event.time.tick + aExp.on;
          oninfo.push({ for: `${aName} (${aExp.on})`, note: true });
        }

        //not sure about this
        if (aExp.off && prev && prev.noteon) {
          event.expression.note.off = aExp.off;//set for reference
          var insidePhraseOff = aExp.off < 0 || (prev && prev.noteon && (prev.expression.note.off === aExp.off));
          if (insidePhraseOff) {
            prev.off = event.time.tick + aExp.off;
            offinfo.push({ for: `${aName} (${aExp.off})`, note: true });
          }
        }

        if (aExp.keyswitch) {
          setKeyswitch(
            event.on - 1,
            pExp.keyswitch,
            { for: aName, note: true });
        }

        if (aExp.velocity !== pExp.velocity) {
          event.velocity = aExp.velocity;
          oninfo.push({ velocity: true, for: aName, note: true });

        }

        setPitchbend(
          event.on - 1,
          aExp.pitchbend,
          { for: aName, note: true });

        for (var key in aExp.controller) {
          setCC(event.on - 1,
            parseInt(key, 10),
            aExp.controller[key],
            { for: aName, note: true });
        }

      });

      setNoteOn(event, oninfo);

      if (prev && prev.noteon) {

 

        setNoteOff(
          prev,
          offinfo);
      }


    }

    if (event.noteoff && prev.noteon) {

      if (prev.staccato) {
        prev.off = event.time.tick - 10;
        info.push({ off: true, for: 'staccato' });
      } else {
        prev.off = event.time.tick; // default slightly detached
        offinfo.push({ off: true, for: 'full' });
      }
      setNoteOff(
        prev,
        offinfo);
    }

  });

  return events;


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