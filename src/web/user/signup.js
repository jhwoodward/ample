
module.exports = function (ngModule) {

  ngModule.directive('signup', [function () {
    return {
      restrict: 'E',
      replace: true,
      template: require('./signup.html'),
      scope: {
        signup: '=',
        hideButtons: '='
      },
      bindToController: true,
      controller: ['$scope', '$mdSidenav', 'userService', '$rootScope', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $mdSidenav, userService, $rootScope) {
    var vm = this;


    vm.signup = function () {
      if (!vm.signupForm.$valid) return;
      return userService.signup(vm.account);
    }

    vm.checkUnique = function () {
      console.log('checking username exists');
      var reserved = ['guest'];
      if (reserved.indexOf(vm.account.key.toLowerCase()) > -1) {
        vm.signupForm.key.$setValidity('reserved', false);
        vm.signupForm.key.$setValidity('unique', true);
        return;
      } else {
        vm.signupForm.key.$setValidity('reserved', true);
      }
      if (!vm.account.key) return;
      userService.checkExists(vm.account.key).then(function(exists) {
        vm.signupForm.key.$setValidity('unique', !exists);
      });
    }

  }

}
