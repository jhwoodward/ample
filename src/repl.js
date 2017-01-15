const repl = require('repl');
var utils = require('./utils');
var loop = utils.loop;
var make = require('./ample').make;
var fs = require('fs');
var cp = require('child_process');
var rudiments = require('./rudiments');
var intruments = require('./instruments');
var colors = require("colors");
var ensembles = require("./ensembles");
var _ = require('lodash');

var config = {};

var ensemble = ensembles.stringTrio;
var prefs = ['triobroz'];

var players = [];
var rules = {};
ensemble.players.forEach(function(player,i) {
  var selectedAnnotation;
  for (var key in player.annotations) {
    if (prefs.indexOf(key) > -1) {
      selectedAnnotation = player.annotations[key];
    }
  }
  if (!selectedAnnotation) {
    selectedAnnotation = player.annotations[Object.keys(player.annotations)[0]];
  }

  var part = '', arrParts = [];
  for (var key in player.test.parts) {
    arrParts.push(key);
  }
  rules = _.merge(rules,player.test.parts,player.test.rules);
  part = arrParts.join(' ');

  players.push({
    part: part,
    channel: i,
    annotations: selectedAnnotation
    });
});
console.log(players,'players');
console.log(rules,'rules');

function getPlayers() {
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
    config.phrases.forEach(function (phrase) {
      rules[phrase.name] = phrase.content;
    });
    config.sections.forEach(function (section) {
      section.parts.forEach(function (part, i) {
        rules[part.name] = part.content;
        rules[`player${i + 1}`] = rules[`player${i + 1}`] || '';
        rules[`player${i + 1}`] += `${loop(part.name, part.loop)}`;
      });
    });

    callback();
  }

}

function play(cmd, callback) {
  var player;
  var args = cmd.replace('play ', '').split(' ');
  var playerId = parseInt(args[0], 10) - 1;

  if (args.length > 1) {
    var part = args[1];
    player = Object.assign({}, players[playerId]);
    player.part = part;
  } else {
    player = players[playerId];
  }
  console.log(player,'player');
  make({ name: 'repl', players: [player] }, rules).play();
  callback('\n');
}

function run(callback) {
  var players = getPlayers();
  make({ name: 'repl', players: players }, rules).play();
  callback('\n');
}


function use(cmd, callback) {
  var rule = cmd.replace('use', '').trim();
  if (rulePresets[rule]) {
    Object.assign(rules, rulePresets[rule]);
    //callback();
    callback(JSON.stringify(rulePresets[rule], null, 2).green);
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
    fs.writeFile('./repl/' + filename + '.config.json', JSON.stringify(config, null, 2));
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
  } else if (cmd.indexOf('play') === 0) {
    play(cmd, callback);
  } else {
    cmd = cmd.replace(/\/n/g, '').trim();
    if (cmd) {
      var results = make(cmd, rules).play();
      var parts = results.map(function (result) { return result.part; });
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
