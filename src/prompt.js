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
          default: `s${i+1}`,
          required: true
        },
        minLength: {
          description: `  Minimum length (beats)`.yellow,
          type: 'integer',
          default: 32
        }
      } 
    };
    for (var j = 0; j < config.parts; j++) {
      var part = {
        properties: {
          name: {
            description: `  Part ${j+1} \n    Name`.green,
            pattern: /^[a-zA-Z]+[a-zA-Z0-9]*$/,
            message: 'Name must be only letters or numbers',
            default: `s${i+1}p${j+1}`,
            required: true
          },
          phraseTimeSignature: {
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
    var partLength;
    console.log(`Section ${i+1}`.yellow);
    section.parts.forEach(function (part, j) {
      partLength = part.phraseBeatLength * part.phraseBeatCount * part.loop;
      console.log(`  Part ${j+1} `.yellow);
      console.log(`    ${part.phraseTimeSignature} = ${part.phraseLength} ticks`.cyan);
      console.log(`     x ${part.loop} = ${partLength} ticks`.green);
    });

    var phraseLengthsDividedByGcd = section.parts.map(function (part) {
      return part.phraseLengthDivided;
    });

    var phraseLengths = section.parts.map(function (part) {
      return part.phraseLength;
    });

    console.log(`\n  gcd(${JSON.stringify(phraseLengths)}) = ${section.gcd} `.gray);
    console.log(`  lcm(${JSON.stringify(phraseLengthsDividedByGcd)}) = ${section.lcm}`.gray);

    console.log(`\n Section ${i+1} will last for ${partLength / 48} beats`.yellow);
    console.log(`\n `);

    section.length = partLength;
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
    var phraseLengths = [];
    var parts = [];
    for (var j = 1; j <= config.parts; j++) {
      var part = section['part' + j];
      var timeSig = part.phraseTimeSignature;
      part.phraseBeatLength = parseInt(timeSig.split(',')[0], 10);
      part.phraseBeatCount = parseInt(timeSig.split(',')[1], 10);
      part.phraseLength = part.phraseBeatLength * part.phraseBeatCount;
      phraseLengths.push(part.phraseLength);
      if (!part.phrase) {
        part.phrase = `${part.phraseBeatLength}, ^${Array(part.phraseBeatCount).join('/')}`;
      }
      parts.push(part);
    }
    var gcd = utils.getGcd(phraseLengths);
    var phraseLengthsDivided = [];
    parts.forEach(function (part) {
      part.phraseLengthDivided = part.phraseLength / gcd;
      phraseLengthsDivided.push(part.phraseLengthDivided);
    });
    var lcm = utils.getLcm(phraseLengthsDivided);
    var length;
    parts.forEach(function (part) {
      part.loop = lcm / part.phraseLengthDivided;
      length = part.phraseBeatLength * part.phraseBeatCount * part.loop; //all part lengths should be the same
    });

    if (length < section.minLength) {
      var multiplier = Math.round((section.minLength * 48) / length);
      parts.forEach(function (part) {
        part.loop = part.loop * multiplier;
      });
    }

    out.sections.push({ gcd: gcd, lcm: lcm, parts: parts });
  }
  return out;
}