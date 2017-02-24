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
    phraseCount: {
      description: 'Number of phrases',
      default: 3,
      type: 'integer',
      required: true
    },
    sectionCount: {
      description: 'Number of sections',
      default: 1,
      type: 'integer',
      required: true
    },
    partCount: {
      description: 'Number of parts',
      default: 3,
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

function getPhraseProps(config) {
  var out = { properties: {} };
  for (var i = 0; i < config.phraseCount; i++) {
    var phraseProps = {
      properties: {
        name: {
          description: ` Phrase ${i + 1} name`.green,
          pattern: /^[a-zA-Z]+[a-zA-Z0-9]*$/,
          message: 'Name must be only letters or numbers',
          default: `phrase${i + 1}`,
          required: true
        },
        timeSignature: {
          description: `    Time signature`.green,
          default: defaults[i] || '48,4',
          enum: [
            '48,7', '48,6', '48,5', '48,4', '48,3',
            '36,7', '36,6', '36,5', '36,4', '36,3',
            '24,7', '24,6', '24,5', '24,4', '24,3'
          ]
        },
        content: {
          description: '    Content'.cyan,
          conform: function (value) {
            //TODO: validate phrase against # beats in time sig
            return true;
          }
        }
      }
    };
    out.properties[`phrase${i + 1}`] = phraseProps;
  }
  return out;
}

function getSectionProps(config) {
  var out = { properties: {} };
  for (var i = 0; i < config.sectionCount; i++) {
    var sectionProps = {
      properties: {
        name: {
          description: `Section ${i + 1} \n  Name`.yellow,
          pattern: /^[a-zA-Z]+[a-zA-Z0-9]*$/,
          message: 'Name must be only letters or numbers',
          default: `section${i + 1}`,
          required: true
        },
        minBeats: {
          description: `  Approx length (beats)`.yellow,
          type: 'integer',
          default: 32
        }
      }
    };

    for (var j = 0; j < config.partCount; j++) {
      var partProps = {
        properties: {
          name: {
            description: `Part ${j + 1} \n  Name`.green,
            pattern: /^[a-zA-Z]+[a-zA-Z0-9]*$/,
            message: 'Name must be only letters or numbers',
            default: `part${j + 1}`,
            required: true
          },
          content: {
            description: `  Content`.green, // space - separated list of phrases previously defined
            default: config[`phrase${j + 1}`].name
          }
        }
      };
      sectionProps.properties[`part${j + 1}`] = partProps;
    }


    out.properties[`section${i + 1}`] = sectionProps;
  }
  return out;
}





prompt.start();
prompt.get(props, gotProps);

function gotProps(err, config) {
  prompt.get(getPhraseProps(config), gotPhraseProps);

  function gotPhraseProps(err, result) {
    Object.assign(config, result);

    config.phrases = [];
    for (var j = 1; j <= config.phraseCount; j++) {
      var phrase = config['phrase' + j];
      phrase.ticksPerBeat = parseInt(phrase.timeSignature.split(',')[0], 10);
      phrase.beatCount = parseInt(phrase.timeSignature.split(',')[1], 10);
      phrase.tickCount = phrase.ticksPerBeat * phrase.beatCount;
      if (!phrase.content) {
        phrase.content = `${phrase.ticksPerBeat}, ^${Array(phrase.beatCount).join('/')}`;
      }
      config.phrases.push(phrase);
    }

    prompt.get(getSectionProps(config), gotSectionProps);
  }

  function gotSectionProps(err, result) {
    Object.assign(config, result);

    config = build(config);
    prompt.get(confirm(config), function (err, result) {
      fs.writeFile('./tmp/config.json', JSON.stringify(config, null, 2));
    });
  }



}

function getPhraseByName(phrases, phraseName) {
  var out;
  phrases.forEach(function (phrase) {
    if (phrase.name === phraseName) {
      out = phrase;
    }
  });
  return out;
}

function build(config) {
  console.log(config);
  var out = {
    name: config.name,
    phrases: config.phrases,
    sections: []
  };

  for (var i = 1; i <= config.sectionCount; i++) {
    var section = config['section' + i];
    var tickCounts = [];
    var parts = [];
    for (var j = 1; j <= config.partCount; j++) {
      var part = section['part' + j];
      var phrases = part.content.split(' ');

      var tickCount = 0;
      phrases.forEach(function (phraseName) {
        var phrase = getPhraseByName(config.phrases, phraseName);
        if (!phrase) {
          console.error(`Phrase '${phraseName}' not found`);
        } else {
          tickCount += phrase.tickCount;
        }
      });
      part.tickCount = tickCount;
      tickCounts.push(part.tickCount);

      parts.push(part);
    }
    var gcd = utils.getGcd(tickCounts);
    var allTicksFactored = [];
    parts.forEach(function (part) {
      part.tickCountFactored = part.tickCount / gcd;
      allTicksFactored.push(part.tickCountFactored);
    });
    var lcm = utils.getLcm(allTicksFactored);
    var tickCountLooped;

    parts.forEach(function (part) {
      part.loop = lcm / part.tickCountFactored;
      tickCountLooped = part.tickCount * part.loop; // all part lengths should be the same
    });
    console.log('tickCountLooped', tickCountLooped);
    console.log('min', section.minBeats * 48);
    if (tickCountLooped < (section.minBeats * 48)) {
      var multiplier = Math.round((section.minBeats * 48) / tickCountLooped); // use Math.ceil to force minBeats
      parts.forEach(function (part) {
        part.loop = part.loop * multiplier;
        tickCountLooped = part.tickCount * part.loop;
      });
    }

    out.sections.push({ name: section.name, gcd: gcd, lcm: lcm, beatCount: tickCountLooped / 48, parts: parts });
  }
  return out;
}

function confirm(config) {
  var out = { properties: {} };
  config.sections.forEach(function (section, i) {
    console.log(`Section ${i + 1}`.yellow);
    section.parts.forEach(function (part, j) {
      console.log(`  Part ${j + 1} `.yellow);
      console.log(`    ${part.content} = ${part.tickCount} ticks`.cyan);
      console.log(`     x ${part.loop} = ${part.tickCount * part.loop} ticks`.green);
    });

    var tickCountsFactored = section.parts.map(function (part) {
      return part.tickCountFactored;
    });

    var tickCounts = section.parts.map(function (part) {
      return part.tickCount;
    });

    console.log(`\n  gcd(${JSON.stringify(tickCounts)}) = ${section.gcd} `.gray);
    console.log(`  lcm(${JSON.stringify(tickCountsFactored)}) = ${section.lcm}`.gray);

    console.log(`\n Section ${i + 1} will last for ${section.beatCount} beats`.yellow);
    console.log(`\n `);

  });
  return out;

}
