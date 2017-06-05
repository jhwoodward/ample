
module.exports = function (ngModule) {

  ngModule.directive('edit', [function () {
    return {
      restrict: 'E',
      replace: true,
      template: require('./edit.html'),
      scope: {
        isOpen: '=',
        song: '=',
        sequencer: '='
      },
      bindToController: true,
      controller: ['$scope', '$mdSidenav', 'storeService', '$state', '$mdDialog', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $mdSidenav, storeService, $state, $mdDialog) {
    var vm = this;
    var orig, origInterpeted;



    $scope.$watch('vm.isOpen', function (open) {
      if (open) {
        activate();
      }
    })

    function activate() {
      if (!vm.song.created) {
        vm.selectedTabIndex = 1;
      }

      vm.nameHasFocus = !vm.song.created;

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
        key: 'track' + (vm.song.tracks.length + 1),
        part: '',
        channel: 0
      };
      vm.song.tracks.push(newTrack);
      vm.sequencer.reorder(vm.song.tracks);
    }


    vm.del = del;

    vm.clone = function () {
      if (!vm.songForm.$valid) return;
      clone().then(function (song) {
        $state.go('root.main', { key: song.key, owner: storeService.user.key });
      });
    }
    vm.save = function () {
      if (!vm.songForm.$valid) return;
      //validate that name is not null and unique in user's namespace

      if (!vm.song.created) {
        save().then(function (song) {
          $state.go('root.main', { key: song.key, owner: storeService.user.key });
        });
      } else {
        save().then(function () {
          $mdSidenav('tracks').close();
        });
      }
    }

    vm.cancel = function () {
      revert();
      $mdSidenav('tracks').close();
    };

    function revert() {
      if (vm.song.created) {
        _.extend(vm.song, orig);
        vm.song.tracks = orig.tracks;
        vm.sequencer.interpreted = origInterpeted;
        vm.sequencer.reorder(vm.song.tracks);
      }

    }


    $mdSidenav('tracks').onClose(function () {

      if (!vm.trackForm.$valid) {
        revert();
      }

    });

    function save() {
      return storeService.save(vm.song);
    };

    function clone() {
      return storeService.clone(vm.song);
    };

    function del(ev) {

      var confirm = $mdDialog.confirm()
        .title('Delete song')
        .textContent('Are you sure you want to delete this song forever?')
        .ariaLabel('Delete')
        .targetEvent(ev)
        .ok('Yes - delete it')
        .cancel('No - keep it');

      $mdDialog.show(confirm).then(function () {
        storeService.delete(vm.song.key).then(function (result) {
          $state.go('root.new');
        });
      });

    }

  }

}
