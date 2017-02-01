module.exports = {
    trumpet: {
      test: {
        cinesamples: `24,2:{legato} cDEF {staccato8} Gfed  {legato} cEdG-Ba {staccato8} gf 
          12,  eFGA 48, {legato} -B/24,a^
          12, {staccato8} a-BCD 127=L
          48, {detached2} -E/ {detached4} dc-ba {staccato4} gf/^
          `,
        chapman: `24,1:  {detached}  c_D E_F {staccato} Gfed  {legato} cEdG-Ba {staccato} gf 
          12,  eFGA 48, {legato} -B/ 24,a^
          12, {staccato} >a-BCD 
          48, {detached} -E/ {detached} dc-ba {staccato} gf/^
          `
      },
      performers: {
        cinesamples: { //VELOCITY MAP setting
          legato: '20=C3 127=C64 -7=ON 5=OFF 40=C1',
          detached4: '20=C3 127=C64 0=ON  -15=OFF  40=C1',
          detached2: '20=C3 127=C64  0=ON  -20=OFF  40=C1',
          staccato: '50=V  0=C64 10=C1',// 0.5=LEN ? harcoded for now
          staccato8: '50=V  0=C64  10=C1',
          staccato4: '100=V  0=C64 10=C1',
          staccato2: '120=V  0=C64 10=C1',
        },
        chapman: {//CC11 = volume, CC1 = vibrato
          legato: '[-2:C] -12=ON 2=OFF ',//this instrument always requires legato -9 at the beginning of the phrase
          detached: '[-2:C] 0=ON -7=OFF',
          staccato: '[-2:+D]  ',
          accent: '120=V'
        }
      }
    },
    horn: {
      test: {
        cinesamples: `24,1:{legato} cDEF {staccato8} Gfed  {legato} cEdG-Ba {staccato8} gf 
          12,  eFGA 48, {legato} -B/24,a^
          12, {staccato8} a-BCD 
          48, {detached2} -E/ {detached4} dc-ba {staccato4} gf/^
          `
      },
      performers: {
        cinesamples: { //VELOCITY MAP setting
          default: '40=V 40=C1',
          legato: '20=C3 127=C64 -1=ON 1=OFF ',
          detached4: '20=C3 127=C64 0=ON  -15=OFF  ',
          detached2: '20=C3 127=C64  0=ON  -20=OFF  ',
          staccato: '50=V  0=C64 10=C1',// 0.5=LEN ? harcoded for now
          staccato8: '50=V  0=C64 10=C1 ',
          staccato4: '100=V  0=C64 10=C1',
          staccato2: '120=V  0=C64 10=C1',
        }
      }

    },
    trombone: {
      test: {

      },
      performers: {
        cinesamples: { //VELOCITY MAP setting
          default: '40=V 40=C1',
          legato: '20=C3 127=C64 -1=ON 1=OFF ',
          detached4: '20=C3 127=C64 0=ON  -15=OFF  ',
          detached2: '20=C3 127=C64  0=ON  -20=OFF  ',
          staccato: '50=V  0=C64 ',// 0.5=LEN ? harcoded for now
          staccato8: '50=V  0=C64  ',
          staccato4: '100=V  0=C64 ',
          staccato2: '120=V  0=C64 ',
        }
      }

    },
    tuba: {
      test: {

      },
      performers: {
        cinesamples: { //VELOCITY MAP setting
          legato: '20=C3 127=C64 -1=ON 1=OFF ',
          detached4: '20=C3 127=C64 0=ON  -15=OFF  ',
          detached2: '20=C3 127=C64  0=ON  -20=OFF  ',
          staccato: '50=V  0=C64 ',// 0.5=LEN ? harcoded for now
          staccato8: '50=V  0=C64  ',
          staccato4: '100=V  0=C64 ',
          staccato2: '120=V  0=C64 ',
        },
        chapman: {//CC11 = volume, CC1 = vibrato
          default: '40=V 10=C1',
          legato: '[-2:C] -12=ON 2=OFF ',//this instrument always requires legato -9 at the beginning of the phrase
          detached: '[-2:C] 0=ON -7=OFF',
          staccato: '[-2:+D]  ',
          accent: '120=V'
        }
      }

    }
  }