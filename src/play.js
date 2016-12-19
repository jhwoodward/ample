var exec = require('child_process').exec;

module.exports = function play(filename){

  exec('open -a \'MIDIPlayer X\' ' + filename, function callback(error, stdout, stderr){
    // result
  });

}
