const repl = require('repl');
var utils = require('./utils');
var loop = utils.loop;
var make = require('./ample').make;
var fs = require('fs');
var cp = require('child_process');
var rulePresets = require('./rules');
var colors = require("colors");

var config = {};
var rules = {
   vib: '[-3:C]',
      nonv: '[-3:+C]',
      spic: '[-3:D]',
      stak: '[-3:+D]',//careful - clashes with staccato annotation
      pizz: '[-3:E]',
  'part1': 'stak {staccato} 1:12,eFGA -BCD 127=L {legato} vib E//^F~e//',
  'part2': '127=L {legato} vib  1:12,cD~EF~GA-BC//^b~C//',
  'part3': '6,part2',
  'part': '1:cDEFG',
  'player1': 'part1',
  'player2': 'part2'
};

function getPlayers() {
  var players = [];
  var channel = 1;
  for (var key in rules) {
    if (key.indexOf('player') === 0) {
      var player = {part:key,channel:channel};
      players.push(player);
      channel +=1;
    }
  }
  return players;
}

function set(cmd, callback) {
  var s = cmd.replace('set ', '');
  var key = s.split('=')[0].trim();
  var val = s.split('=')[1].trim();

  rules[key] = val;
  callback(null, rules);
}

function generate(cmd, callback) {

  var prompt = cp.spawnSync('node', ['./src/prompt.js'], { stdio: 'inherit' });

  fs.readFile('./tmp/config.json', readConfig);

  function readConfig(err, data) {

    config = JSON.parse(data);
    //build rules from config
    rules = {};
    config.phrases.forEach(function(phrase) {
      rules[phrase.name] = phrase.content;
    });
    config.sections.forEach(function(section) {
      section.parts.forEach(function(part,i) {
        rules[part.name] = part.content;
        rules[`player${i+1}`] = rules[`player${i+1}`] || '';
        rules[`player${i+1}`] += `${loop(part.name, part.loop)}`;
      });
    });
  
    callback();
  }

}

function run(callback) {
  var players = getPlayers();
  callback(null, make({ name: 'repl', players: players }, rules).play());
}


function use(cmd, callback) {
   var rule = cmd.replace('use', '').trim();
  if (rulePresets[rule]) {
    Object.assign(rules, rulePresets[rule]);
    //callback();
    callback(JSON.stringify(rulePresets[rule],null,2).green);
  } else {
    callback(`No rule found called ${rule}`.red);
  }
}

function save(cmd, callback) {
  var filename = cmd.replace('save', '').trim() || config.name;
  if (!filename) {
    console.error('No filename');
  } else {
    if (fs.existsSync('./repl/' + filename + '.js')) {
      filename += '_' + new Date().getTime();
    } 
    var req = `var make = require('../src/ample').make;\nvar utils = require('../src/utils');\nvar loop = utils.loop;\n\n`;
    var data = `var rules = ${JSON.stringify(rules, null, 2).replace(/\"/g, '\'')};\n\n`;
    var players = `var players = ${JSON.stringify(getPlayers(), null, 2).replace(/\"/g, '\'')};\n\n`;
    var make = `make({ name: '${filename}', players: players }, rules).play();\n`;
    fs.writeFile('./repl/' + filename + '.config.json',JSON.stringify(config,null,2));
    fs.writeFile('./repl/' + filename + '.js', req + data + players + make, function () {
      callback('Saved');
    });

  }
}

function myEval(cmd, context, filename, callback) {

  if (cmd.indexOf('rules') === 0) {
    callback(null, rules);
  } else if (cmd.indexOf('set') === 0) {
    set(cmd, callback);
  } else if (cmd.indexOf('run') === 0) {
    run(callback);
  } else if (cmd.indexOf('save') === 0) {
    save(cmd, callback);
  } else if (cmd.indexOf('gen') === 0) {
    generate(cmd, callback);
  } else if (cmd.indexOf('use') === 0) {
    use(cmd, callback);
  } else {
    cmd = cmd.replace(/\/n/g, '').trim();
    if (cmd) {
      var results = make(cmd, rules).play();
      var parts = results.map(function(result) { return result.part;});
      callback(parts);
    } else {
      callback();
    }

  }
}

const r = repl.start({
  prompt: '> ',
  input: process.stdin,
  output: process.stdout,
  eval: myEval
});
