var config = require('../web.config');
var _ = require('lodash');

module.exports = function (ngModule) {

  ngModule.service('storeFactory', ['$http', 'userService', function ($http, userService) {

    var root = config.store;

    function Store(type, props, onLoad) {
      this.props = props;
      this.type = type;
      this.onLoad = onLoad;
    }

    Store.prototype = {
      save: function (item) {
        item = this.getPayload(item);
        if (item.created) {
          return this.update(item);
        } else {
          return this.create(item);
        }
      },
      clone: function (item) {
        var clone = _.cloneDeep(item);
        delete clone.created;
        clone.owner = userService.user.key;
        delete clone.key;
        return this.save(clone);
      },
      create: function (item) {
        return $http({
          method: 'POST',
          url: root + '/one/' + this.type,
          data: item,
          headers: {
            'Authorization': 'JWT ' + userService.token
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
            'Authorization': 'JWT ' + userService.token
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
            'Authorization': 'JWT ' + userService.token
          }
        }).then(angular.noop, onFail);
        function onFail(err) {
          console.log('Failed to delete', err);
        }
      },
      getAll: function (owner) {
        owner = owner || userService.user.key;
        return $http({
          method: 'GET',
          url: root + '/all/' + this.type + '/' + (owner)
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
      getLastLoad: function () {
        var lastLoad = localStorage.getItem(this.type + ':lastLoad');
        if (lastLoad) {
          return JSON.parse(lastLoad);
        }
        return undefined;
      },
      getOne: function (key, owner) {
        return $http({
          method: 'GET',
          url: root + '/one/' + this.type + '/' + owner + '/' + key
        }).then(onSuccess.bind(this), onFail);
        function onSuccess(response) {

          var lastLoad = JSON.stringify({ key: key, owner: owner });
          localStorage.setItem(this.type + ':lastLoad', lastLoad);

          var item = response.data;
          item.tags = item.tags || [];
          _.extend(item, this.props);
          if (this.onLoad) {
            return this.onLoad.bind(item)();
          }
          return item;
        }
        function onFail(err) {
          console.error('Failed to get one', err);
        }
      },
      checkKeyExists: function (key, owner) {

        return this.getOne(key, owner).then(exists);
        function exists(item) {
          return item;
        }


      }
    };

    return {
      create: function (type, getNew, getPayload, props, onLoad) {

        var prototype = {
          new: function () {
            var item = getNew();
            item.tags = [];
            var store = this;
            item.checkKeyExists = function () {
              return store.checkKeyExists(this.key, userService.user.key);
            }
            Object.assign(item, props);
            return item;
          },
          getPayload: getPayload
        };

        function NewStore(type, props, onLoad) {
          Store.call(this, type, props, onLoad);
        }
        NewStore.prototype = _.extend({}, Store.prototype, prototype);
        NewStore.prototype.constructor = NewStore;

        return new NewStore(type, props, onLoad);
      }
    };


  }]);

};
