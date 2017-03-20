
var key = {
  C: 'K()K', //aminor
  F: 'K(-b)K', //dminor
  Bb: 'K(-b-e)K', //gminor
  Eb: 'K(-b-e-a)K', //cminor
  Ab: 'K(-b-e-a-d)K', //fminor
  Db: 'K(-b-e-a-d-g)K', //bflat minor
  'F#': 'K(+f+c+g+d+a+e)K', //eflat minor
  B: 'K(+f+c+g+d+a)K', //gsharp minor
  E: 'K(+f+c+g+d)K', //csharp minor
  A: 'K(+f+c+g)K', // fsharp minor
  D: 'K(+f+c)K', // b minor
  G: 'K(+f)K', // e minor
  C: 'K()K' //a minor
};
key['C#'] = key.Db;
key['D#'] = key.Eb;
key['Gb'] = key['F#'];
key['G#'] = key.Ab;
key['A#'] = key.Bb;
key.Amin = key.C;
key.Dmin = key.F;
key.Gmin = key.Bb;
key.Cmin = key.Eb;
key.Fmin = key.Ab;
key.Bbmin = key.Db;
key.Ebmin = key['F#'];
key['G#min'] = key.B;
key['C#min'] = key.E;
key['F#min'] = key.A;
key['Bmin'] = key.D;
key['Emin'] = key.G;

module.exports = key;