var _ = require('lodash');

module.exports = function (ngModule) {
  ngModule.controller('NotationController', ['$scope', 'userService', '$mdDialog', controller]);
}

function controller($scope, $mdDialog) {
  var vm = this;

  vm.cancel = function () {
    $mdDialog.cancel();
  };

  vm.try = function () {
   
  }

  vm.next = function () {

  }

  vm.prev = function () {

  }

}
