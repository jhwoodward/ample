
module.exports =
  {
    key: {
      cmaj: 'K()K', //aminor
      fmaj: 'K(-b)K', //dminor
      bflat: 'K(-b-e)K', //gminor
      eflat: 'K(-b-e-a)K', //cminor
      aflat: 'K(-b-e-a-d)K', //fminor
      dflat: 'K(-b-e-a-d-g)K', //bflat minor
      fsharp: 'K(+f+c+g+d+a+e)K', //eflat minor
      bmaj: 'K(+f+c+g+d+a)K', //gsharp minor
      emaj: 'K(+f+c+g+d)K', //csharp minor
      amaj: 'K(+f+c+g)K', // fsharp minor
      dmaj: 'K(+f+c)K', // b minor
      gmaj: 'K(+f)K', // e minor
      cmaj: 'K()K' //a minor
    },
    scale: {
      none: 'S()S',
      cblues: 'S(CD-EEGA-B)S', 
      cmajtriad: 'S(CEG)S',
      fblues: 'S(FG-AACD-E)S', 
      gblues: 'S(GA-BBDEF)S' 
    }
  };