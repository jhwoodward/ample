
module.exports = function (ngModule) {

  ngModule.directive('songList', [function () {
    return {
      restrict: 'E',
      template: require('./song-list.html'),
      scope: {
        song: '=',
        listName: '@',
        onSelected: '&'
      },
      bindToController: true,
      controller: ['$scope', 'storeService', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, storeService) {
    var vm = this;

    $scope.$watch('vm.listName', activate);

    function activate() {
      if (!vm.listName) return;
      storeService.getAll(vm.listName).then(function (songs) {
        vm.songs = songs;
      });
    }

    vm.select = function(song) {
      vm.onSelected({song: song});
    }

  }

}
