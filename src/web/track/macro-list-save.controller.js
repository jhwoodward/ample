var _ = require('lodash');

module.exports = function (ngModule) {
  ngModule.controller('MacroListController', ['$scope', '$mdDialog', 'macroListService', 'macros', controller]);
}

function controller($scope, $mdDialog, macroListService, macros) {
  var vm = this;

  vm.macroList = macroListService.new();
  vm.macroList.macros = macros;

  function close() {
    $mdDialog.hide();
  }

  vm.cancel = function () {
    close();
  };

  function save() {
    return;
  };

  vm.save = function () {
    if (!vm.valid) return;

    macroListService.save(vm.macroList).then(function (item) {
      close();
    });

  }



}
