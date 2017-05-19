
module.exports = function (ngModule) {

  ngModule.directive('tracks', [function () {
    return {
      restrict: 'E',
      replace: true,
      template: require('./tracks.html'),
      scope: {
        isOpen: '=',
        song: '=',
        sequencer: '='
      },
      bindToController: true,
      controller: ['$scope', '$mdSidenav', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $mdSidenav) {
    var vm = this;
    var orig, origInterpeted;

    $scope.$watch('vm.isOpen', function(open) {
      if (open) {
        activate();
      }
    })

    function activate() {
      orig = _.cloneDeep(vm.song);
      origInterpeted = _.cloneDeep(vm.sequencer.interpreted);
      vm.song.tracks.forEach((t, i) => t.originalIndex = i);

    }

    vm.deleteTrack = function (index) {
      vm.song.tracks.splice(index, 1);
    }

    vm.moved = function (index) {
      vm.song.tracks.splice(index, 1);
      vm.sequencer.reorder(vm.song.tracks);
    }


    vm.addTrack = function () {
      var newTrack = {
        part: '',
        channel: 0
      };
      vm.song.tracks.push(newTrack);
      vm.sequencer.reorder(vm.song.tracks);
    }

    vm.ok = function () {
      $mdSidenav('tracks').close();
    }

    vm.cancel = function () {
      _.extend(vm.song, orig);
      vm.song.tracks = orig.tracks;
      vm.sequencer.interpreted = origInterpeted;
      vm.sequencer.reorder(vm.song.tracks);
      $mdSidenav('tracks').close();
    };

  }

}
