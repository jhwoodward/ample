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

    if (event.noteon) {

      event.on = event.time.tick;
  //    event.legato = event.expression.note.legato || (prev && prev.noteon && prev.expression.phrase.legato && event.expression.phrase.legato);
  //    event.staccato = event.expression.note.staccato || (prev && prev.noteon && prev.expression.phrase.staccato && event.expression.phrase.staccato);

      var pExp = event.expression.phrase;
      var pName = event.expression.phrase.name;

      var nExp = event.expression.note;//not yet impleneted - everything is thorugh artiulations currnetly
    
      console.log(pExp);

      setKeyswitch(
        event.on - 1,
        pExp.keyswitch,
        { for: pName, phrase: true });

      event.velocity = pExp.velocity;
      info.push({ velocity: true, for: `${pName} (${pExp.velocity})`, phrase:true });
    
      setPitchbend(
        event.on - 1, 
        pExp.pitchbend, 
        { for: pName, phrase: true });

      for (var key in pExp.controller) {
        setCC(event.on - 1, 
          parseInt(key, 10), 
          pExp.controller[key], 
          {for: pName, phrase:true }); 
      }

    
      //  console.log('phrase on', phrase.on)
      var newPhraseOn = pExp.on && (prev && prev.noteon && (prev.expression.phrase.on === pExp.on));
      if (newPhraseOn) {
        event.on += pExp.on;
        info.push({ on: true, for: `${pName} (${pExp.on})`, phrase:true });
      }
      //   console.log('new phrase on', newPhraseOn)

      var articulations = {
        before: event.expression.note.articulations.filter(function (item) { return !item.after; }),
        after: event.expression.note.articulations.filter(function (item) { return item.after; }),
      }

      articulations.after.forEach(function (articulation) {

        var aExp = articulation.expression;
        var aName = articulation.name;
        if (aExp.keyswitch) {
          setKeyswitch(
            prev.on - 1,
            e.keyswitch,
            { for: aName, note: true});
        }

        if (aExp.on) {
          event.on += aExp.on;
          info.push({ on: true, for: `${aName} (${aExp.on})`, note: true });
        }

        if (aExp.off) {
          event.off += aExp.off;
          info.push({ off: true, for: `${aName} (${aExp.on})`, note: true });
        }

        if (Object.keys(aExp.controller).length) {
          for (var key in aExp.controller) {
            setCC(event.on - 1, 
              parseInt(key, 10), 
              aExp.controller[key],
              {for: aName, note: true }); 
          }
        }

      });

      articulations.before.forEach(function (articulation) {

        var aExp = articulation.expression;
        var aName = articulation.name;
        if (aExp.keyswitch) {
          setKeyswitch(
            event.on - 1,
            pExp.keyswitch,
            { for: aName, note: true });
        }

       if (aExp.velocity !== pExp.velocity) {
          event.velocity = aExp.velocity;
          info.push({ velocity: true, for: aName, note: true });
      
       }
            
        setPitchbend(
          event.on - 1, 
          aExp.pitchbend, 
          { for: aName, note: true });

        for (var key in aExp.controller) {
          setCC(event.on - 1, 
            parseInt(key, 10), 
            aExp.controller[key], 
            {for: aName, note: true }); 
        }
      });


      setNoteOn(event, info);

      info = [];

      if (prev && prev.noteon) {

        prev.off = event.time.tick;
     //   var shouldAdjustOff = true;//pExp.off && (next && next.noteon && next.expression.phrase.expression.off === pExp.off);
     //   if (shouldAdjustOff) {
        prev.off += prev.expression.phrase.off;
        info.push({ off: true, for: `${pName} (${prev.expression.phrase.off})`, phrase: true });
     //   }
        //not sure about this
     //   if (exp.off) {
      //    prev.off += exp.off;
      //    info.push({ off: true, for: `$${exp.off}`, phrase: true });
      //  }

        if (pName.indexOf('staccato') === 0) {
          prev.off = prev.time.tick + ((event.time.tick - prev.time.tick) / 2);
          info.push({ off: true, for: 'staccato (half)' });
        }

        setNoteOff(
          prev,
          info);
      }

    }

    if (event.noteoff && prev.noteon) {

      if (prev.staccato) {
        prev.off = event.time.tick - 10;
        info.push({ off: true, for: 'staccato' });
      } else {
        prev.off = event.time.tick; // default slightly detached
        info.push({ off: true, for: 'full' });
      }
      setNoteOff(
        prev,
        info);
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
    info = info.map(function(item){return item.for;});
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
    info = info.map(function(item){return item.for;});
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