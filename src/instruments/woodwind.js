module.exports = {
  clarinet: {
    test: {
      rules: {
        tune: `cEGe  cE>Gec//^`,
      },
      parts: {
        herring: `24,1:  {legato} 20=C11  cDEF {staccato8} Gfed  {legato} 127=C11 cEdG-Ba {staccato8} gf 
            12,  e_FGA 48, {legato} -B/ 24, a^
            12, {staccato8} a_-BCD 
            48, {legato} -E/ {detached} dc-ba {staccato} gf/^
            `,
        diamant: `24,1: {legato} tune {staccato} tune`
      }

    },
    performers: {
      herring: { //CC11 = volume, CC1 = vibrato
        default: '[-2:C] 40=V 80=C11 10=C1',
        legato: '[-2:C] -5=ON 5=OFF ',
        detached: '[-2:C] 0=ON -7=OFF',
        staccato: '[-2:D]  120=V',// 0.5=LEN ? harcoded for now
        staccato8: '[-2:D] 20=V '
      },
      diamanti: {
        default: '40=V 50=C1',
        staccato: '[-3:D]   50=C1',//currently having to set dynamics in every phrase to revert after cc accent
        staccatosoft: '[-3:+D]  50=C1',
        staccatotight: '[-3:E]  50=C1',
        detached: '[-3:C] 0=ON -5=OFF  50=C1',
        legato: '[-3:C] -5=ON 1=OFF 50=C1',//need to split out phrase legato from note legato
        'legato-nonvib': '[-3:+C] -7=ON 5=OFF  50=C1',
        accent: '120=C1 16000=P 120=V'
      }
    }

  },
  bassoon: {
    test: {
      rules: {
        tune: `dEGe  dEGed//^`,
        tun2: `cEGecEGec//^`,
      },
      parts: {
        part1: `24,-1: {legato} tune {staccato} tune  {legato} tun2 {staccato} tun2`
      }

    },
    performers: {
      fattori: {
        default: '40=V 70=C1',
        staccato: '[-3:+D]   50=C1',//currently having to set dynamics in every phrase to revert after cc accent
        detached: '[-3:C] 0=ON -5=OFF  50=C1',
        legato: '[-3:C] -5=ON 1=OFF 50=C1',//need to split out phrase legato from note legato
        'legato-nonvib': '[-3:D] -7=ON 5=OFF  50=C1',
        accent: '16000=P 120=V'
      }
    }

  },
  oboe: {
    test: {
      rules: {
        tune: `dE>Ge  d>EGed//^`,
        tun2: `cEGe>cEG>ec//^`,
      },
      parts: {
        part1: `24,2: {legato} tune {staccato} tune  {legato} tun2 {staccato} tun2`
      }

    },
    performers: {
      lovecchio: {
        default: '40=V 70=C1',
        staccato: '[-2:+D]   50=C1',//currently having to set dynamics in every phrase to revert after cc accent
        detached: '[-2:C] 0=ON -5=OFF  50=C1',
        legato: '[-2:C] -5=ON 1=OFF 50=C1',//need to split out phrase legato from note legato
        'legato-nonvib': '[-2:D] -7=ON 5=OFF  50=C1',
        accent: '16000=P 120=V'
      }
    }

  },
  flute: {
    test: {
      rules: {
        tune: `dEGe  dEGed//^`,
        tun2: `cEGecEGec//^`
      },
      parts: {
        arts: `24,2: {legato} tune {staccato} tune  {legato} tun2 {staccato} tun2`,
        accent: `24,2: {detached} >c_D >E_F >G_A_B C {staccato} >Gf>ed {legato} >c/////^`
      }

    },
    performers: {
      maratti: {
        default: '40=V 90=C1',
        staccato: '[-2:D]   50=C1',//currently having to set dynamics in every phrase to revert after cc accent
        staccatotight: '[-2:A]   50=C1',
        detached: '[-2:C] 0=ON -5=OFF  50=C1',
        legato: '[-2:C] -7=ON 1=OFF 50=C1',//need to split out phrase legato from note legato
        'legato-nonvib': '[-1:F] -7=ON 5=OFF  50=C1',
        accent: '16000=P 120=V'
      }
    }

  }
};