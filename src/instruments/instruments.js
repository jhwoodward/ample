module.exports = {
  piano: {
    name: 'piano',
    default: '0=C64 85=C1 85=C11 8192=P 90=V 0=ON -5=OFF',
    pedaldown: '127=C64',
    pedalup: '0=C64',
    accent: '100=V'
  },
  strings: require('./strings/strings'),
  woodwind: require('./woodwind/woodwind'),
  brass: require('./brass/brass')
}