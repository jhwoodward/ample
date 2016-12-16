var parser = require('note-parser');


function isNote(char) {
	var notes = 'abcdefgABCDEFG';
	return notes.indexOf(char) > -1;
}

function isSustain(char) {
	return char === '/';
}

function isIgnore(char) {
	return char === ' ';
}

function pitch(char, octave,accidental) {
  return parser.parse(char + octave).midi + accidental;
}

function isUpperCase(char) {
	return char === char.toUpperCase();
}

function isPling(char) {
	return char === '!';
}

function isLowerCase(char) {
	return char === char.toLowerCase();
}

function isComma(char) {
	return char === ',';
}

function isColon(char) {
	return char === ':';
}

function isPlus(char) {
	return char === '+';
}

function isMinus(char) {
	return char === '-';
}

function send(trackId, s, startBeat) {

	var lastNote;
	startBeat = startBeat || 1;
	var beatCount = 0;
	var beatStep = 1;
	var octave = 1;
	var plingCount = 0;
	var numbers = [];
	var char;
	var octaveReset = false;
	var accidental = 0; //sharp or flat / +1 / -1
	
	for (var i =0;i < s.length;i++) {
	
		if (isIgnore(s[i])) { continue; }

		char = s[i];
		
		if (isNote(char)) {
		
			if (lastNote) {
				sendNote(trackId, lastNote);
				lastNote.sent = true;
				
				if (!octaveReset) {
					if (isLowerCase(char)) {
						//down
						if (plingCount) {
							if (pitch(char, octave, accidental) >= lastNote.pitch) {
								octave -= plingCount;
							}
						} else {
							if (pitch(char, octave, accidental) > lastNote.pitch || 
								lastNote.char === char.toUpperCase()) {
								octave -= 1;
							}
						}
					}
					
					if (isUpperCase(char)) {
						//up
						if (plingCount) {
							if (pitch(char, octave, accidental) <= lastNote.pitch) {
								octave += plingCount;
							}
						} else {
							if (pitch(char, octave, accidental) < lastNote.pitch ||
								lastNote.char === char.toLowerCase()) {
								octave += 1;
							}
						}

					}
				}
			}
			
			if (octaveReset) {
				if (isLowerCase(char)) {
					octave -=1;
				}
				octaveReset = false;
			} 
			
			lastNote = {char: char, pitch: pitch(char, octave, accidental), on: beatCount + startBeat, sustain: beatStep, sent: false};
			
			beatCount += beatStep;
			plingCount = 0;
			accidental = 0;
		}
		
		if (isSustain(char)) {
			lastNote.sustain += beatStep;
			beatCount += beatStep;
		}
		
		if (isPling(char)) {
			plingCount +=1;
		} 
		
		if (isPlus(char)) {
			accidental += 1;
		}
		if (isMinus(char)) {
			accidental -= 1;		
		}
		
		if (!isNaN(char) || char === '-') {
			numbers.push(char);
		}
		
		if (isComma(char)) {
			if (numbers.length) {
				beatStep = parseInt(numbers.join(''),10) / 48;
				numbers = [];
			}
		}
		
		if (isColon(char)) {
			if (numbers.length) {
				octave = parseInt(numbers.join(''),10) + 4;
				numbers = [];
				octaveReset = true;
			}
		}
		
		if (i === s.length - 1) {
		 	if (!lastNote.sent) {
				sendNote(trackId, lastNote);
			}
			return beatCount + startBeat;
		}
	}
}

function loop(phrase, n) {
	var out = '';
	for (var i = 1;i<=n;i++) {
   	out += phrase;
   }
  return out;
}

function sendNote(trackId, note) {
  listeners.forEach(function(cb) {
    cb(trackId,
    {
      pitch: note.pitch,
      on: note.on,
      sustain: note.sustain
    });
  });
}

var listeners = [];
var api= {
  send: send,
  listen: function(cb) {
    listeners.push(cb);
  }
};

module.exports = api;