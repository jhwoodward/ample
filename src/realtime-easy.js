var easymidi = require('easymidi');
var output = new easymidi.Output('IAC Driver Bus 1');

output.send('noteon', {
  note: 64,
  velocity: 127,
  channel: 3
});

setTimeout(function(){

  output.send('noteoff', {
  note: 64,
  velocity: 127,
  channel: 3
});

},500);

setTimeout(function(){

  output.send('noteon', {
  note: 66,
  velocity: 127,
  channel: 3
});
},400);

setTimeout(function(){

  output.send('noteoff', {
  note: 66,
  velocity: 127,
  channel: 3
});

},800);
