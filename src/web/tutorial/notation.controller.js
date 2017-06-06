var _ = require('lodash');

module.exports = function (ngModule) {
  ngModule.controller('NotationController', ['$scope', '$mdDialog', controller]);
}

function controller($scope, $mdDialog) {
  var vm = this;

  vm.cancel = function () {
    $mdDialog.hide();
  };

  vm.try = function () {
   
  }

  vm.next = function () {

  }

  vm.prev = function () {

  }

}
