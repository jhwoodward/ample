
module.exports = function (ngModule) {
  ngModule.controller('LoginController', ['$rootScope', 'userService', '$mdDialog', controller]);
}

function controller($rootScope, userService, $mdDialog) {
  var vm = this;

  vm.login = function () {
    userService.login(vm.account).then(onResponse);
    function onResponse(result) {
      if (result.status) {
        if (result.data.message === 'Incorrect password') {
          vm.loginForm.password.$setValidity('incorrect', false);
        } else if (result.data.message === 'User not found') {
          vm.loginForm.key.$setValidity('notfound', false);
        }
      } else {
        $mdDialog.hide();
        $rootScope.$broadcast('login');
      }
    }

  }

  vm.onChangePassword = function () {
    vm.loginForm.password.$setValidity('incorrect', true);
  }

  vm.onChangeUsername = function () {
    vm.loginForm.key.$setValidity('notfound', true);
  }

}
