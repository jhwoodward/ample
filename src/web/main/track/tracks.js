
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
      controller: ['$scope', '$mdSidenav', 'storeService', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $mdSidenav, storeService) {
    var vm = this;
    var orig, origInterpeted;

    $scope.$watch('vm.isOpen', function (open) {
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

   
    vm.delete = del;

    vm.ok = function () {
      save();
      $mdSidenav('tracks').close();
    }

    vm.cancel = function () {
      _.extend(vm.song, orig);
      vm.song.tracks = orig.tracks;
      vm.sequencer.interpreted = origInterpeted;
      vm.sequencer.reorder(vm.song.tracks);
      $mdSidenav('tracks').close();
    };

    function save() {

      var payload = {
        tracks: []
      };
      for (var key in vm.song) {
        if (key !== 'tracks' && key !== 'parts' && vm.song.hasOwnProperty(key)) {
          payload[key] = vm.song[key];
        }
      }
      var tracks = _.cloneDeep(vm.song.tracks);
      tracks.forEach(track => {
        delete track.$$hashKey;
        var t = {};
        for (var key in track) {
          if (track.hasOwnProperty(key)) {
            t[key] = track[key];
          }
        }
        payload.tracks.push(t);
      });
      if (payload.master) {
        delete payload.master.interpreted;
      }
      delete payload.parts;

      storeService.save(payload).then(function (result) {
        console.log(result);
      });
    };
    

    function del() {
      storeService.delete(vm.song.key).then(function (result) {
        console.log(result);
      });
    }

  }

}
