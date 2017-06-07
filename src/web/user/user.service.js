var config = require('../web.config');
var _ = require('lodash');

module.exports = function (ngModule) {

  ngModule.factory('userService', ['$http', function ($http) {

    var root = config.store;
      
    var guest = { key: 'guest', name: 'guest' };

    function UserService() {
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

    UserService.prototype = {

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
          this.user = response.data.user;
          this.token = response.data.token;
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
      isLoggedIn: function () {
        return this.user !== guest;
      },
      logout: function () {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.user = guest;
        delete this.token;
      }
    };

    return new UserService();

  }]);

};
