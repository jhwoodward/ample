module.exports = {
  name: 'Jingle',
  description: '',
  parts: {
    melody: {
      channel: 0,
      part: `12,1:
	>'E^'E^'E^'EE>>E'E'E >>E/EE^ 
	E/>>'G^c//D>>'E^// ///^
	^F/F/F//F e/'e^//e e/d/d/E/d// >'G^///
24,1:
	E/// E^// E^E^ E/// F^// e^// d^d^ c//^
12,1:     
	F/F/F//F F/ e/ e/ 8,eee 
12, G/G/f/d/c/// ///^
    `
    },
    bass: {
      channel: 0,
      sub: {
        a: `24,-1:cGgG cGgG cGgG ccDE`
      },
      part: `(a)=(24,-1:cGgGcGgGcGgGccDE)
{default}={0=ON 0=OFF}

(a)

FAfA cEcEd +Fd+F Gfed

(a)

FAfA cEcE ggAB CgC^
      `
    },
    part3: {
      channel: 1,
      part: ``
    },
    part4: {
      channel: 3,
      part: ``
    }
  }
};
