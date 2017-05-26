var _ = require('lodash');

module.exports = function (ngModule) {
  ngModule.controller('SignupController', ['$scope', 'userService', '$mdDialog', controller]);
}

function controller($scope, userService, $mdDialog) {
  var vm = this;

  vm.cancel = function () {
    $mdDialog.cancel();
  };

  vm.signup = function () {
    if (!vm.signupForm.$valid) return;
     
    userService.signup(vm.account).then(function(account) {
      userService.login(account).then(function(){
        $mdDialog.hide();
      });
      return account;
    });
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
    userService.checkExists(vm.account.key).then(function (exists) {
      vm.signupForm.key.$setValidity('unique', !exists);
    });
  }


}
