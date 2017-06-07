var config = require('../web.config');
var _ = require('lodash');

module.exports = function (ngModule) {

  ngModule.service('songService', ['storeFactory', function (storeFactory) {

    function getPayload(song) {
      var payload = {
        tracks: []
      };
      for (var key in song) {
        if (key !== 'tracks' && song.hasOwnProperty(key)) {
          payload[key] = song[key];
        }
      }
      payload.tracks = song.tracks.map(t => {
        return {
          key: t.key,
          channel: t.channel,
          part: t.part
        };
      });
      return payload;
    }

    function getNew() {
      return {
        name: '',
        description: '',
        master: {
          part: ''
        },
        tracks: [
          {
            key: 'track1',
            channel: 0,
            part: ''
          },
          {
            key: 'track2',
            channel: 0,
            part: ''
          },
          {
            key: 'track3',
            channel: 0,
            part: ''
          }
        ]
      };
    }

    var props = {
      requireName: true
    };

    return storeFactory.create('scriptophonics', getNew, getPayload, props);

  }]);

};
