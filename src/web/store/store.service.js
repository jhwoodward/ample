var config = require('../web.config');


module.exports = function (ngModule) {

  ngModule.service('storeService', ['$http', function ($http) {

    var root = config.store;
   
    function Store(type) {
      this.type = type;
    }

    Store.prototype = {
      new: function () {
        return {
          name: 'new song',
          description: '',
          master: {
            part: ``,
            isMaster: true
          },
          parts: {
            part1: {
              channel: 0,
              part: ``
            },
            part2: {
              channel: 1,
              part: ``
            },
            part3: {
              channel: 2,
              part: ``
            },
            part4: {
              channel: 3,
              part: ``
            }
          }
        };
      },
      save: function (item) {
        if (item.created) {
          return this.update(item);
        } else {
          return this.create(item);
        }
      },
      create: function (item) {
        return $http({
          method: 'POST',
          url: root + '/one/' + this.type,
          data: item,
        }).then(onSuccess, onFail);
        function onSuccess(response) {
          Object.assign(item, response.data);
          return item;
        }
        function onFail(err) {
          console.error('Saved failed', err);
        }
      },
      update: function (item) {
        return $http({
          method: 'PUT',
          url: root + '/one/' + this.type,
          data: item,
        }).then(onSuccess, onFail);
        function onSuccess(response) {
          return response.data;
        }
        function onFail(err) {
          console.error('Saved failed', err);
        }
      },
      delete: function (key) {
        return $http({
          method: 'DELETE',
          url: root + '/one/' + this.type + '/' + key
        }).then(angular.noop, onFail);
        function onFail(err) {
          console.log('Failed to delete', err);
        }
      },
      getAll: function () {
        return $http({
          method: 'GET',
          url: root + '/all/' + this.type
        }).then(onSuccess, onFail);
        function onSuccess(response) {
          return response.data;
        }
        function onFail(err) {
          console.log('Failed to get all', err);
        }
      },
      getList: function (tag) {
        return $http({
          method: 'GET',
          url: root + '/list/' + this.type + '/' + tag
        }).then(onSuccess, onFail);
        function onSuccess(response) {
          return response.data;
        }
        function onFail(response) {
          console.log('Failed to get list');
        }
      },
      getOne: function (key) {
        return $http({
          method: 'GET',
          url: root + '/one/' + this.type + '/' + key
        }).then(onSuccess, onFail);
        function onSuccess(response) {
          return response.data;
        }
        function onFail(err) {
          console.error('Saved failed', err);
        }
      }
    };
    return new Store('scriptophonics');
    /*
    return {
      create: function (type) {
        var store = new Store(type);
        return store;
      }
    };*/

  }]);

};
