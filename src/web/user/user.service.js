var config = require('../web.config');
var _ = require('lodash');

module.exports = function (ngModule) {

  ngModule.factory('userService',  ['$http', 'storeService', function ($http, storeService) {

    var root = config.store;

    var api = {

      signup: function (account) {
        return $http({
          method: 'POST',
          url: root + '/user/signup',
          data: account,
        }).then(onSuccess, onFail);
        function onSuccess(response) {
          Object.assign(account, response.data);
          return account;
        }
        function onFail(err) {
          console.error('Signup failed', err);
        }
      },
      login: function (account) {
        return $http({
          method: 'POST',
          url: root + '/user/login',
          data: account,
        }).then(onSuccess, onFail);
        function onSuccess(response) {
          storeService.user = response.data.user;
          storeService.token = response.data.token;
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('token', response.data.token);
          return response.data.user;
        }
        function onFail(err) {
          console.error('Login failed', err);
          return err;
        }
      },
      checkExists: function (key) {
        return $http({
          method: 'GET',
          url: root + '/user/exists/' + key
        }).then(onSuccess, onFail);
        function onSuccess(response) {
          return response.data.exists;
        }
        function onFail(err) {
          console.error('Failed to get user', err);
        }
      },
      getUser: function (key) {
        return $http({
          method: 'GET',
          url: root + '/user/one/' + key
        }).then(onSuccess, onFail);
        function onSuccess(response) {
          var item = response.data;
          return item;
        }
        function onFail(err) {
          console.error('Failed to get user', err);
        }
      },
      isLoggedIn: storeService.isLoggedIn.bind(storeService),
      logout: function () {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        storeService.clearUser();
      }
    };

    return api;

  }]);

};
