var config = require('../web.config');
var _ = require('lodash');

module.exports = function (ngModule) {

  ngModule.service('songService', ['storeFactory', 'macroListService', '$q', function (storeFactory, macroListService, $q) {

    function getPayload(song) {
      var payload = {
        tracks: []
      };
      for (var key in song) {
        if (key !== 'tracks' && song.hasOwnProperty(key)) {
          payload[key] = song[key];
        }
      }
      if (payload.master && payload.master.interpreted) {
        delete payload.master.interpreted;
      }


      payload.tracks = song.tracks.map(t => {

        var out = {
          key: t.key,
          trackIndex: t.trackIndex,
          panelIndex: t.panelIndex,
          channel: t.channel,
          part: t.part,
          imports: t.imports
        };

        //save macros locally as backup
        if (t.macros) {
          var macros = _.clone(t.macros);
          delete macros.parsed;
          out.macros = macros;
        }

        if (t.owner) {
          out.owner = t.owner;
        }
        return out;
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
            trackIndex: 1,
            channel: 0,
            part: '',
            imports: []
          },
          {
            key: 'track2',
            trackIndex: 2,
            channel: 0,
            part: '',
            imports: []
          },
          {
            key: 'track3',
            trackIndex: 3,
            channel: 0,
            part: '',
            imports: []
          }
        ]
      };
    }

    function onLoad() {

      var useMaster = this.useMaster ? 1 : 0;

      this.tracks.forEach((track, i) => {
        track.trackIndex = track.trackIndex || (i + 1);
        track.panelIndex = track.panelIndex || (i + useMaster);
      });

      return this;
      var deferred = $q.defer();



      var imports = this.tracks.reduce((acc, track) => {
        track.imports = track.imports || [];
        acc = acc.concat(track.imports);
        return acc;
      }, []).reduce((acc, imp) => {
        if (acc.indexOf(imp) === -1) {
          acc.push(imp);
        }
        return acc;
      }, []);

      if (!imports.length) {
        deferred.resolve(this);
      }

      imports.forEach((imp, index) => {
        var owner = imp.split('/')[0];
        var key = imp.split('/')[1];
        macroListService.getOne(key, owner).then(success.bind(this), fail.bind(this));

        function success(loaded) {
          loaded.macros = loaded.macros.map(m => {
            m.source = imp;
            return m;
          });
          this.tracks.filter(t => t.imports.indexOf(imp) > -1).forEach(track => {
            track.macros = track.macros || [];
            track.macros = track.macros.concat(loaded.macros);
          });
          if (index === imports.length - 1) {
            deferred.resolve(this);
          }
        }
        function fail(err) {
          console.error('Unable to load macrolist ' + i, err);
          if (index === imports.length - 1) {
            deferred.resolve(this);
          }
        }
      });


      return deferred.promise;
    }

    var props = {
      requireName: true
    };

    return storeFactory.create('scriptophonics', getNew, getPayload, props, onLoad);

  }]);

};
