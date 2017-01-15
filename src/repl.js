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

var triobroz = {
  rules: {


    tune: '>GedE>FdcD>Ed>Ed>c//^ ',
   //   'part1': '{legato} 1:12,eFGA -BCD 127=L {legato-nonvib} E//^F~e/c/g/^',
    part1: '24,0: {detached} cGc {legato} 12,cDEFGA-B  C//^b~C//^',
    part3: '127=L {staccato} 0:12,cbagfed  {legato} c//^G~c//^',
    //   'part': '{legato} 1:c {default} D  {legato} E {default} F  G',
    // 'part1': `12,1: {detached} c_D_E F_G_A B C {pizzicato} >Gf>ed {legato} c/////^`,
   // part1: '1: 24, {pizzicato} tune {legato} tune {detached} tune   '
  //  part1: `24,1: {detached} >c_D >E_F >G_A_B C {staccato} >Gf>ed {legato} >c/////^`
    // 'part2': `{pizzicato} 2:24,CCCCC`,
    // 'part3':''
    // part3: '',
    //part1: '50=VB 127=L {spiccato} 48,1:c >c {default} 24, c_D E_F e_d {spiccato} 48,  >c >c c c >c',
    //// part1: '50=VB 127=L {spiccato} 48,1:c >c {legato} 24, cD EF ed {spiccato} 48,  >c >c c c >c',
    //part2:'',
    // part3:''
    //part2:'',
    // part3:''
  },
  annotations: annotations.strings.violin.triobroz,
  config: {
    defaultExpression: {
      dynamics: 120,
      keyswitch: { pitch: 24, char: 'C'}
    }
  }
};

var cineTrumpet = {
  rules: {
    'part1': `24,2:{legato} cDEF {staccato8} Gfed  {legato} cEdG-Ba {staccato8} gf 
    12,  eFGA 48, {legato} -B/24,a^
    12, {staccato8} a-BCD 127=L
    48, {detached2} -E/ {detached4} dc-ba {staccato4} gf/^
    `
  },
  annotations: annotations.brass.trumpet.cinesamples,
  config: {
    defaultExpression: {
      velocity: 40,
      dynamics: 10
    }
  }
};

var cineHorn = {
  rules: {
    'part1': `24,1:{legato} cDEF {staccato8} Gfed  {legato} cEdG-Ba {staccato8} gf 
    12,  eFGA 48, {legato} -B/24,a^
    12, {staccato8} a-BCD 
    48, {detached2} -E/ {detached4} dc-ba {staccato4} gf/^
    `
  },
  annotations: annotations.brass.horn.cinesamples,
  config: {
    defaultExpression: {
      velocity: 40,
    //  dynamics: 127,
      controller: { 1: 40 }
    }
  }
};



var herringClarinet = {
  rules: {
    'part1': `24,1:  {legato} 20=C11  cDEF {staccato8} Gfed  {legato} 127=C11 cEdG-Ba {staccato8} gf 
    12,  e_FGA 48, {legato} -B/ 24, a^
    12, {staccato8} a_-BCD 
    48, {legato} -E/ {detached} dc-ba {staccato} gf/^
    `
  },
  annotations: annotations.woodwind.clarinet.herring,
  config: {
    defaultExpression: {
      velocity: 40,
      dynamics: 10
    }
  }
};


var diamantiClarinet = {
  rules: {
    /*
    'part1': `24,1:  {legato} 20=C11  cDEF {staccato} >Gfed  {legato} 127=C11 cEdG-Ba {staccatotight} >g>f 
    12,  eFGA 48, {legato} -B/a 12,  a-BCD 
    48, {detached} -E/ {detached} dc-ba {staccatotight} 30==C1 gf////^
    `*/
     tune: `cEGe  cE>Gec//^`,
    part1: `24,1: {legato} tune {staccato} tune`
  },
  annotations: annotations.woodwind.clarinet.diamanti,
  config: {
    defaultExpression: {
      velocity: 40,
      dynamics: 50 // should set back to default after accent. currently have to have dynamics set in phrase to revert after accent
    }
  }
};

var fattoriBassoon = {
  rules: {
    /*
    part1: `24,-1:  {legato} 20=C11  cDEF {staccato} Gfed  {legato} 127=C11 cEdG-Ba {staccato} gf 
    12,  eFGA 48, {legato} -B/ 24,a^ 12,  a-BCD 
    48, {detached} -E/ {detached} dc-ba {staccato} 30==C1 gf////^
    `,*/
    tune: `dEGe  dEGed//^`,
    tun2: `cEGecEGec//^`,
    part1: `24,-1: {legato} tune {staccato} tune  {legato} tun2 {staccato} tun2`
  },
  annotations: annotations.woodwind.bassoon.fattori,
  config: {
    defaultExpression: {
      velocity: 40,
      dynamics: 70 // should set back to default after accent. currently have to have dynamics set in phrase to revert after accent
    }
  }
};

var lovecchioOboe = {
  rules: {
    /*
    part1: `24,-1:  {legato} 20=C11  cDEF {staccato} Gfed  {legato} 127=C11 cEdG-Ba {staccato} gf 
    12,  eFGA 48, {legato} -B/ 24,a^ 12,  a-BCD 
    48, {detached} -E/ {detached} dc-ba {staccato} 30==C1 gf////^
    `,*/
    tune: `dE>Ge  d>EGed//^`,
    tun2: `cEGe>cEG>ec//^`,
    part1: `24,2: {legato} tune {staccato} tune  {legato} tun2 {staccato} tun2`
  },
  annotations: annotations.woodwind.oboe.lovecchio,
  config: {
    defaultExpression: {
      velocity: 40,
      dynamics: 70 // should set back to default after accent. currently have to have dynamics set in phrase to revert after accent
    }
  }
};

var marattiFlute = {
  rules: {
    /*
    part1: `24,-1:  {legato} 20=C11  cDEF {staccato} Gfed  {legato} 127=C11 cEdG-Ba {staccato} gf 
    12,  eFGA 48, {legato} -B/ 24,a^ 12,  a-BCD 
    48, {detached} -E/ {detached} dc-ba {staccato} 30==C1 gf////^
    `,*/
    tune: `dEGe  dEGed//^`,
    tun2: `cEGecEGec//^`,
    //part1: `24,2: {legato} tune {staccato} tune  {legato} tun2 {staccato} tun2`,
    part1: `24,2: {detached} >c_D >E_F >G_A_B C {staccato} >Gf>ed {legato} >c/////^`
  },
  annotations: annotations.woodwind.oboe.maratti,
  config: {
    defaultExpression: {
      velocity: 40,
      dynamics: 90 // should set back to default after accent. currently have to have dynamics set in phrase to revert after accent
    }
  }
};

var chapmanTrumpet = {
  rules: {
    'part1': `24,1:  {detached}  c_D E_F {staccato} Gfed  {legato} cEdG-Ba {staccato} gf 
    12,  eFGA 48, {legato} -B/ 24,a^
    12, {staccato} >a-BCD 
    48, {detached} -E/ {detached} dc-ba {staccato} gf/^
    `
  },
  annotations: annotations.brass.trumpet.chapman,
  config: {
    //alwaysAffectOn: true,//force on offset to apply even at the start of a phrase
    defaultExpression: {
      velocity: 40,
      dynamics: 10
    }
  }
};

var friedlanderViolin = {
  rules: {
    tune: '>GedE>FdcD>Ed>Ed>c//^ ',
 //   part1: '{legato} 1:24,e~FGA -BCD  E/^>F~e/c/g/^',
    part2: '127=L {legato} 1:12,cDEFGA-B {legato} C^^^b~C//^',
    part3: '127=L {staccato} 0:12,cbagfed  {legato} c//^G~c//^',
    //   'part': '{legato} 1:c {default} D  {legato} E {default} F  G',
  // part1: `24,1: {detached} >c_D >E_F >G_A_B C {staccato} >Gf>ed {legato} >c/////^`,
    part1: '{legatoquick} 12,1:e~FGA -BCD////  E/^>F~e/c/g/^',
   // part1: '1: 24, {legato} tune {detached} tune {staccato} tune  '
  },
  annotations: annotations.strings.violin.friedlander,
  config: {
    defaultExpression: {
      velocity: 100,
      dynamics: 100
    }
  }
};

var settings = cineHorn;

var rules = settings.rules;
var players = [
  {
    part: 'part1',
    channel: 0,
    annotations: settings.annotations,
    config: settings.config
  },
  {
    part: 'part2',
    channel: 1,
    annotations: settings.annotations,
    config: settings.config
  },
  {
    part: 'part3',
    channel: 2,
    annotations: settings.annotations,
    config: settings.config
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
