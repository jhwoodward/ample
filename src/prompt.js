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
      pattern: /^[a-zA-Z\s\-]+$/,
      message: 'Name must be only letters, spaces, or dashes',
      default: 'test',
      required: true
    },
    parts: {
      default: 3,
      type: 'integer',
      required: true
    },
    sections: {
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
    var section = { properties: {} };
    for (var j = 0; j < config.parts; j++) {
      var part = {
        properties: {
          phraseTimeSignature: {
            default: defaults[j] || '48,4',
            enum: [
              '48,7', '48,6', '48,5', '48,4', '48,3',
              '36,7', '36,6', '36,5', '36,4', '36,3',
              '24,7', '24,6', '24,5', '24,4', '24,3'
            ]
          },
          phrase: {
            conform: function (value) {
              //TODO: validate phrase against # beats in time sig
              return true;
            }
          }
        }
      };
      section.properties[`part${j + 1}`] = part;
    }
    sections.properties[`section${i + 1}`] = section;
  }
  return sections;
}

function confirmLoop(config) {
  var out = { properties: {} };
  config.sections.forEach(function (section, i) {

    console.log(`section ${i + 1}`.yellow);
    section.parts.forEach(function (part, j) {
      var totalTicks = part.phraseBeatLength * part.phraseBeatCount * part.loop;
      console.log(`  part ${j + 1} `.yellow);
      console.log(`    ${part.phraseTimeSignature} = ${part.phraseLength} ticks`.cyan);
      console.log(`      x ${part.loop} = ${totalTicks} ticks`.green);
    });

    var phraseLengthsDividedByGcd = section.parts.map(function (part) {
      return part.phraseLengthDivided;
    });

    var phraseLengths = section.parts.map(function (part) {
      return part.phraseLength;
    });

    console.log(`
   gcd(${JSON.stringify(phraseLengths)}) = ${section.gcd}  
   lcm(${JSON.stringify(phraseLengthsDividedByGcd)}) = ${section.lcm}
   `.magenta);

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
  var out = { sections: [] };
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
      parts.push(part);
    }
    var gcd = utils.getGcd(phraseLengths);
    var phraseLengthsDivided = [];
    parts.forEach(function (part) {
      part.phraseLengthDivided = part.phraseLength / gcd;
      phraseLengthsDivided.push(part.phraseLengthDivided);
    });
    var lcm = utils.getLcm(phraseLengthsDivided);
    parts.forEach(function (part) {
      part.loop = lcm / part.phraseLengthDivided;
    });
    out.sections.push({ gcd: gcd, lcm: lcm, parts: parts });
  }
  return out;
}