var _ = require('lodash');

module.exports = function (ngModule) {

  ngModule.directive('storeItem', [function () {
    return {
      restrict: 'E',
      replace: true,
      template: require('./store-item.html'),
      scope: {
        storeItem: '=',
        valid: '='
      },
      bindToController: true,
      controller: ['$scope', '$timeout', '$mdSidenav', '$rootScope', '$state', '$log', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $timeout, $mdSidenav, $rootScope, $state, $log) {
    var vm = this;

    var orig;

    $scope.$watch('vm.storeItem', function (item) {
      if (!item) return;
      orig = _.cloneDeep(item);
    });

    $scope.$watch('vm.storeItem.key', function (key) {
      if (!key) return;
      orig.key = key;
    });


    $scope.$watch('vm.storeItemForm.$valid', function (valid) {
      vm.valid = valid;
    });

    vm.checkUniqueKey = function () {
      if (!vm.storeItem.key) return;
      console.log('checking key unique');
      var reserved = [];
      if (reserved.indexOf(vm.storeItem.key.toLowerCase()) > -1) {
        vm.storeItemForm.key.$setValidity('reserved', false);
        vm.storeItemForm.key.$setValidity('unique', true);
        return;
      } else {
        vm.storeItemForm.key.$setValidity('reserved', true);
      }
      vm.storeItem.checkKeyExists().then(function (item) {
        if (item) {
          //specific to macrolist - needs to be abstreacted
          var macros = vm.storeItem.macros.concat(item.macros);
          _.extend(vm.storeItem, item);
          vm.storeItem.macros = macros;
        } else {
          vm.storeItem = orig;
        }
        
       // vm.storeItemForm.key.$setValidity('unique', !item);
      });

    }

  }
}
