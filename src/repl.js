const repl = require('repl');
var make = require('../src/ample').make;

var rules = {
  part1: 'cDEF',
  part2: 'part1 part1 part1',
  part3: '6,part2'
}
function myEval(cmd,context,filename,callback) {
  console.log(cmd);
   if (cmd.indexOf('rules') === 0) {
      callback(null,rules);
   } 
   else if (cmd.indexOf('set') === 0) {
    var s = cmd.replace ('set ','');
    var key = s.split('=')[0].trim();
    var val = s.split('=')[1].trim();
    this.lineParser.reset();
    this.bufferedCommand = '';
    rules[key] = val;
    callback(null,rules);
  } else if (cmd.indexOf('run') === 0) {
    var parts = [];
    for (var key in rules) {
      if (key.indexOf('part') ===0) {
        parts.push(key);
      }
    }
    console.log(parts);
    callback(null,make({parts:parts},rules).play());
  } else {
     callback(null,make(cmd,rules).play());
  }

 

}



const r = repl.start({prompt: '> ', eval:myEval});
/*
r.defineCommand('set', {
  help: 'Make a tune',
  action: function(s) {
    var key = s.split('=')[0];
    var val = s.split('=')[1];
    this.lineParser.reset();
    this.bufferedCommand = '';
    rules[key] = val;
    console.log(rules);
     this.displayPrompt();
  }
});
r.defineCommand('play', {
  help: 'Make a tune',
  action: function(s) {
    make(s,rules).play();
    this.displayPrompt();
  }
});*/