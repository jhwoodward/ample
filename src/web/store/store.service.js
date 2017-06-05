var config = require('../web.config');
var _ = require('lodash');

module.exports = function (ngModule) {

  ngModule.service('storeService', ['$http', function ($http) {

    var root = config.store;
    var guest = { key: 'guest', name: 'guest' };

    function Store(type) {
      this.type = type;
      var user = localStorage.getItem('user');
      if (user) {
        try {
          this.user = JSON.parse(user);
          this.token = localStorage.getItem('token');
        } catch (e) {
          localStorage.removeItem('user');
          this.user = guest;
        }
      } else {
        this.user = guest;
      }
    }

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
      }; });
      /*
      var tracks = _.cloneDeep(song.tracks);
      tracks.forEach(track => {
        delete track.$$hashKey;
        delete track.annotations;
        delete track.substitutions;
        delete track.macros;
        delete track.originalIndex;
        var t = {};
        for (var key in track) {
          if (track.hasOwnProperty(key)) {
            t[key] = track[key];
          }
        }
        payload.tracks.push(t);
      });
      */
      return payload;
    }

    Store.prototype = {
      clearUser: function () {
        this.user = guest;
        delete this.token;
      },
      new: function () {
        return {
          name: '',
          description: '',
          tags: [],
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
      },
      save: function (item) {
        item = getPayload(item);
        if (item.created) {
          return this.update(item);
        } else {
          return this.create(item);
        }
      },
      clone: function (item) {
        var clone = _.cloneDeep(item);
        delete clone.created;
        clone.owner = this.user.key;
        delete clone.key;
        return this.save(clone);
      },
      create: function (item) {
        return $http({
          method: 'POST',
          url: root + '/one/' + this.type,
          data: item,
          headers: {
            'Authorization': 'JWT ' + this.token
          }
        }).then(onSuccess, onFail);
        function onSuccess(response) {
          Object.assign(item, response.data);
          return item;
        }
        function onFail(err) {
          console.error('Create failed', err);
        }
      },
      update: function (item) {
        return $http({
          method: 'PUT',
          url: root + '/one/' + this.type,
          data: item,
          headers: {
            'Authorization': 'JWT ' + this.token
          }
        }).then(onSuccess, onFail);
        function onSuccess(response) {
          return response.data;
        }
        function onFail(err) {
          console.error('Update failed', err);
        }
      },
      delete: function (key) {
        return $http({
          method: 'DELETE',
          url: root + '/one/' + this.type + '/' + key,
          headers: {
            'Authorization': 'JWT ' + this.token
          }
        }).then(angular.noop, onFail);
        function onFail(err) {
          console.log('Failed to delete', err);
        }
      },
      getAll: function (owner) {
        return $http({
          method: 'GET',
          url: root + '/all/' + this.type + '/' + owner
        }).then(onSuccess, onFail);
        function onSuccess(response) {
          return response.data;
        }
        function onFail(err) {
          console.log('Failed to get all', err);
        }
      },
      getList: function (tag, owner) {
        return $http({
          method: 'GET',
          url: root + '/list/' + this.type + '/' + owner + '/' + tag
        }).then(onSuccess, onFail);
        function onSuccess(response) {
          return response.data;
        }
        function onFail(response) {
          console.log('Failed to get list');
        }
      },
      getOne: function (key, owner) {
        return $http({
          method: 'GET',
          url: root + '/one/' + this.type + '/' + owner + '/' + key
        }).then(onSuccess, onFail);
        function onSuccess(response) {

          var lastLoad = JSON.stringify({ key: key, owner: owner });
          localStorage.setItem('lastLoad', lastLoad);

          var item = response.data;
          item.tags = item.tags || [];
          return item;
        }
        function onFail(err) {
          console.error('Failed to get one', err);
        }
      },
      isLoggedIn: function () {
        return this.user !== guest;
      },
    };
    //    return new Store('midiscript');
    return new Store('scriptophonics');

  }]);

};
