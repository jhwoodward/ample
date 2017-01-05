const repl = require('repl');
var utils = require('./utils');
var loop = utils.loop;
var make = require('./ample').make;
var fs = require('fs');
var cp = require('child_process');
var rulePresets = require('./rules');
var annotations = require('./annotations');
var colors = require("colors");

var config = {};

var rules = {
  'part1': '{staccato} 1:12,eFGA -BCD 127=L {legato-nonvib} E//^F~e//^',
 'part2': '127=L {legato} 1:12,cD~EF~GA-B {legato} C//^b~C//^',
  'part3': '127=L {staccato} 0:12,cbagfed  {legato} c//^G~c//^',
 // 'part': '{legato} 1:c {default} D  {legato} E {default} F  G',
 // 'part1': `90=L {default} 12,1:c_D E_F {staccato} Gfed {default} c/////^`,
 // 'part2': `{pizzicato} 2:24,CCCCC`,
 // 'part3':''
// part1: '60=VB {spiccato} 24:1:c >c {legato} cDE {spiccato}  >c >c c c >c',
 //part2:'',
// part3:''
};

var players = [
  {
    part: 'part1',
    channel: 0,
    annotations: annotations.triobroz
  },
  {
    part: 'part2',
    channel: 1,
    annotations: annotations.triobroz
  },
  {
    part: 'part3',
    channel: 2,
    annotations: annotations.triobroz
  },
];

function getPlayers() {
  /*
  var players = [];
  var channel = 0;
  for (var key in rules) {
    if (key.indexOf('player') === 0) {
      var player = {part:key, channel:channel,  annotations: annotations.triobroz };
      players.push(player);
      channel +=1;
    }
  }*/
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

function play(cmd, callback) {
  var player;
   var args = cmd.replace('play ', '').split(' ');
   var playerId = parseInt(args[0], 10) - 1;

   if (args.length > 1) {
     var part = args[1];
     player = Object.assign({},players[playerId]);
     player.part = part;
   } else {
     player = players[playerId];
   }
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
  } else if (cmd.indexOf('play') === 0) {
    play(cmd, callback);
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
