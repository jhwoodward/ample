const repl = require('repl');
var make = require('./ample').make;
var fs = require('fs');
var cp = require('child_process');

var rules = {
  part1: 'cDEF',
  part2: 'part1 part1 part1',
  part3: '6,part2'
};

function getParts() {
  var parts = [];
  for (var key in rules) {
    if (key.indexOf('part') === 0) {
      parts.push(key);
    }
  }
  return parts;
}

function set(cmd, callback) {
  var s = cmd.replace('set ', '');
  var key = s.split('=')[0].trim();
  var val = s.split('=')[1].trim();
  this.lineParser.reset();
  this.bufferedCommand = '';
  rules[key] = val;
  callback(null, rules);
}






function generate(cmd, callback) {
  console.log('generate');
  var prompt = cp.spawnSync('node', ['./src/prompt.js'], { stdio: 'inherit' });

  console.log('prompt end');
  fs.readFile('./tmp/config.js', readConfig);

  function readConfig(err, data) {
    console.log('read config');
    var config = JSON.parse(data);
    callback(JSON.stringify(config,null,2));
  }

}

function run(callback) {
  var parts = getParts();
  callback(null, make({ name: 'repl', parts: parts }, rules).play());
}

function save(cmd, callback) {

  var filename = cmd.replace('save', '').trim();
  if (!filename) {
    console.error('No filename')
  } else {
    var req = `var make = require('../src/ample').make;\nvar utils = require('../src/utils');\nvar loop = utils.loop;\n\n`;
    var data = `var rules = ${JSON.stringify(rules, null, 2).replace(/\"/g, '\'')};\n\n`;
    var parts = `var parts = ${JSON.stringify(getParts(), null, 2).replace(/\"/g, '\'')};\n\n`;
    var make = `make({ name: '${filename}', parts: parts }, rules).play();\n`;
    fs.writeFile('./repl/' + filename + '.js', req + data + parts + make, function () {
      callback('Saved');
    });
  }
}

function myEval(cmd, context, filename, callback) {
  console.log(cmd);
  if (cmd.indexOf('rules') === 0) {
    callback(null, rules);
  }
  else if (cmd.indexOf('set') === 0) {
    set(cmd, callback);
  } else if (cmd.indexOf('run') === 0) {
    run(callback);
  } else if (cmd.indexOf('save') === 0) {
    save(cmd, callback);
  } else if (cmd.indexOf('gen') === 0) {
    generate(cmd, callback);
  } else {
    cmd = cmd.replace(/\/n/g, '').trim();
    if (cmd) {
      callback(null, make(cmd, rules).play());
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
