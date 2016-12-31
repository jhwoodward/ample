var prompt = require('prompt');
var colors = require("colors");
var utils = require("./utils");
var fs = require('fs');
//
// Setting these properties customizes the prompt.
//
prompt.message = '';
//prompt.delimiter = colors.green(":");

var props = {
  properties: {
    name: {
      description: 'Name',
      pattern: /^[a-zA-Z\s\-]+$/,
      message: 'Name must be only letters, spaces, or dashes',
      default: 'test',
      required: true
    },
    parts: {
      description: 'Number of parts',
      default: 3,
      type: 'integer',
      required: true
    },
    sections: {
      description: 'Number of sections',
      default: 1,
      type: 'integer',
      required: true
    }
  }
};

var defaults;

defaults = {
  0: '48,4',
  1: '36,7',
  2: '24,5'
}

defaults = {
  0: '48,4',
  1: '48,3',
  2: '24,4'
}

function getSectionProps(config) {
  var sections = { properties: {} };

  for (var i = 0; i < config.sections; i++) {
    var section = { 
      properties: {
         name: {
          description: `Section ${i+1} \n  Name`.yellow,
          pattern: /^[a-zA-Z]+[a-zA-Z0-9]*$/,
          message: 'Name must be only letters or numbers',
          default: `section${i+1}`,
          required: true
        },
        minBeats: {
          description: `  Minimum length (beats)`.yellow,
          type: 'integer',
          default: 32
        }
      } 
    };
    for (var j = 0; j < config.parts; j++) {
      var defaultPhraseName = config.sections > 1 ? `phrase${i+1}${j+1}` : `phrase${j+1}`;
      var part = {
        properties: {
          name: {
            description: `  Part ${j+1} \n    Phrase name`.green,
            pattern: /^[a-zA-Z]+[a-zA-Z0-9]*$/,
            message: 'Name must be only letters or numbers',
            default: defaultPhraseName,
            required: true
          },
          timeSignature: {
            description: `    Time signature`.green,
            default: defaults[j] || '48,4',
            enum: [
              '48,7', '48,6', '48,5', '48,4', '48,3',
              '36,7', '36,6', '36,5', '36,4', '36,3',
              '24,7', '24,6', '24,5', '24,4', '24,3'
            ]
          },
          phrase: {
            description: '    Phrase'.cyan,
            conform: function (value) {
              //TODO: validate phrase against # beats in time sig
              return true;
            }
          }
        }
      };
      section.properties[`part${j+1}`] = part;
    }
    sections.properties[`section${i+1}`] = section;
  }
  return sections;
}

function confirmLoop(config) {
  var out = { properties: {} };
  config.sections.forEach(function (section, i) {
    var loopedTickCount;
    console.log(`Section ${i+1}`.yellow);
    section.parts.forEach(function (part, j) {
      loopedTickCount = part.ticksPerBeat * part.beatCount * part.loop; //should be the same for each part
      console.log(`  Part ${j+1} `.yellow);
      console.log(`    ${part.timeSignature} = ${part.tickCount} ticks`.cyan);
      console.log(`     x ${part.loop} = ${loopedTickCount} ticks`.green);
    });

    var tickCountsFactored = section.parts.map(function (part) {
      return part.tickCountFactored;
    });

    var tickCounts = section.parts.map(function (part) {
      return part.tickCount;
    });

    console.log(`\n  gcd(${JSON.stringify(tickCounts)}) = ${section.gcd} `.gray);
    console.log(`  lcm(${JSON.stringify(tickCountsFactored)}) = ${section.lcm}`.gray);

    console.log(`\n Section ${i+1} will last for ${loopedTickCount / 48} beats`.yellow);
    console.log(`\n `);

    section.beats = loopedTickCount / 48;
  });


  return out;

}

prompt.start();
prompt.get(props, function (err, config) {
  prompt.get(getSectionProps(config), function (err, result) {
    Object.assign(config, result);
    config = build(config);
    prompt.get(confirmLoop(config), function (err, result) {

      fs.writeFile('./tmp/config.js', JSON.stringify(config));

    });

  });
});

function build(config) {
  var out = { 
    name: config.name, 
    sections: [] 
  };
  //work out min length of each section to fully loop all parts
  for (var i = 1; i <= config.sections; i++) {
    var section = config['section' + i];
    var allTicks = [];
    var parts = [];
    for (var j = 1; j <= config.parts; j++) {
      var part = section['part' + j];
      part.ticksPerBeat = parseInt(part.timeSignature.split(',')[0], 10);
      part.beatCount = parseInt(part.timeSignature.split(',')[1], 10);
      part.tickCount = part.ticksPerBeat * part.beatCount;
      allTicks.push(part.tickCount);
      if (!part.phrase) {
        part.phrase = `${part.ticksPerBeat}, ^${Array(part.beatCount).join('/')}`;
      }
      parts.push(part);
    }
    var gcd = utils.getGcd(allTicks);
    var allTicksFactored = [];
    parts.forEach(function (part) {
      part.tickCountFactored = part.tickCount / gcd;
      allTicksFactored.push(part.tickCountFactored);
    });
    var lcm = utils.getLcm(allTicksFactored);
    var tickCount;
    parts.forEach(function (part) {
      part.loop = lcm / part.tickCountFactored;
      tickCount = part.ticksPerBeat * part.beatCount * part.loop; //all part lengths should be the same
    });

    if (tickCount < (section.minBeats * 48)) {
      var multiplier = Math.round((section.minBeats * 48) / tickCount);
      parts.forEach(function (part) {
        part.loop = part.loop * multiplier;
      });
    }

    out.sections.push({ name: section.name, gcd: gcd, lcm: lcm, parts: parts });
  }
  return out;
}