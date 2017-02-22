const repl = require('repl');
var utils = require('./utils');
var loop = utils.loop;
var make = require('./ample').make;
var fs = require('fs');
var cp = require('child_process');
var rudiments = require('./rudiments');
var colors = require("colors");
var ensembles = require("./ensembles");
var _ = require('lodash');
var argv = require('yargs').argv;
//var watcher = require('filewatcher')();
var seq = require('./seq');

var config = {};

var players, rules, conductor;

if (argv.load) {
  load(argv.load);
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
  var args = getArgs(cmd);
  var filteredPlayers;
  var playerIds;
  if (args.parts) {
    if (!isNaN(args.parts)) {
      playerIds = [args.parts -1];
    } else {
      playerIds = args.parts.split(',').map(function (i) {
        if (!isNaN(i)) {
          return parseInt(i, 10) - 1;
        } else {
          return i;
        }
      });
    }
    console.log(playerIds);

    filteredPlayers = players.filter(function (player, i) {
      return playerIds.indexOf(player.part) > -1 || playerIds.indexOf(i) > -1;
    });
  } else {
    filteredPlayers = players;
  }


  make({ name: 'repl', players: filteredPlayers }, rules, conductor).play(args.from, args.to);
  callback('\n');
}

function getArgs(cmd) {
  var bits = cmd.split(' ');
  var args = bits.filter(function (bit) { return bit.indexOf('--') === 0; });
  var out = {};
  args.forEach(function (arg) {
    var kv = arg.split('=');
    if (!isNaN(kv[1])) {
      kv[1] = parseInt(kv[1], 10);
    }
    out[kv[0].replace('--', '')] = kv[1];
  });
  return out;
}

function run(cmd, callback) {
  var args = getArgs(cmd);

  make({ name: 'repl', players: players }, rules, conductor).play(args.from, args.to);
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

/*
watcher.on('change', function (file, stat) {
  console.log('File modified: %s', file);
  if (!stat) console.log('deleted');
});
*/

var filename;
function load(cmd, callback) {
  unwatch(filename);
  if (cmd.indexOf('load') === 0) {
    filename = cmd.replace('load', '').trim()
  } else {
    filename = cmd;
  }
  var out;
  try {
    watch(filename);
    var loaded = require('../repl/' + filename);
    players = loaded.players;
    rules = loaded.rules;
    conductor = loaded.conductor;
    out = `Loaded ${filename} & watching...`.green;

  } catch (e) {
    out = `${e} (${filename})`.red;
  }

  if (callback) {
    callback(out);
  } else {
    console.log(out);
  }
}

function watch(filename) {
  filename = `./repl/${filename}.js`;
  fs.watchFile(filename, (curr, prev) => {
    reload();
  });
}

function unwatch(filename) {
  if (filename) {
    filename = `./repl/${filename}.js`;
    fs.unwatchFile(filename);
  }

}

function reload(callback) {
  if (!filename) { callback('No file loaded'.red); }
  var out;
  try {
    delete require.cache[require.resolve('../repl/' + filename)]
    var loaded = require('../repl/' + filename);
    players = loaded.players;
    rules = loaded.rules;
    conductor = loaded.conductor;
    out = `Reloaded ${filename}.`.green;
  } catch (e) {
    out = `Error in file ${filename}`.red;
  }

  if (callback) {
    callback(out);
  } else {
    console.log(out);
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
    var sReq = `var make = require('../src/ample').make;\nvar utils = require('../src/utils');\nvar loop = utils.loop;\n\n`;
    var sRules = `var rules = ${JSON.stringify(rules, null, 2).replace(/\"/g, '\'')};\n\n`;
    var sConductor = `var conductor = ${JSON.stringify(conductor, null, 2).replace(/\"/g, '\'')};\n\n`;
    var sPlayers = `var players = ${JSON.stringify(players, null, 2).replace(/\"/g, '\'')};\n\n`;
    var sMake = `make({ name: '${filename}', players: players }, rules, conductor).play();\n`;
    if (config && Object.keys(config).length > 0) {
      fs.writeFile('./repl/' + filename + '.config.json', JSON.stringify(config, null, 2));
    }
    fs.writeFile('./repl/' + filename + '.js', sReq + sRules + sConductor + sPlayers + sMake, function () {
      callback('Saved'.green);
    });

  }
}

var defaultPlayer = 0; //the default player (channel) when typing notes straight into the repl
function myEval(cmd, context, filename, callback) {

  if (cmd.indexOf('rules') === 0) {
    callback(null, rules);
  } else if (cmd.indexOf('set') === 0) {
    set(cmd, callback);
  } else if (cmd.indexOf('run') === 0) {
    run(cmd, callback);
  } else if (cmd.indexOf('save') === 0) {
    save(cmd, callback);
  } else if (cmd.indexOf('load') === 0) {
    load(cmd, callback);
  } else if (cmd.indexOf('reload') === 0) {
    reload(callback);
  } else if (cmd.indexOf('gen') === 0) {
    generate(cmd, callback);
  } else if (cmd.indexOf('use') === 0) {
    use(cmd, callback);
  } else if (cmd.indexOf('player') === 0) {
    var args = cmd.replace('player ', '').split(' ');
    defaultPlayer = parseInt(args[0], 10) - 1;
  } else if (cmd.indexOf('play') === 0) {
    play(cmd, callback);
  } else {
    cmd = cmd.replace(/\/n/g, '').trim();
    if (cmd) {

      var player = players[defaultPlayer];
      player.part = cmd;

      var results = make({ name: 'repl', players: [player] }, rules).play();
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
