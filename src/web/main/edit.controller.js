var _ = require('lodash');

module.exports = function (ngModule) {
  ngModule.controller('editController', ['$scope', '$mdDialog', 'song', 'sequencer', 'storeService', controller]);
}

function controller($scope, $mdDialog, song, sequencer, storeService) {
  var vm = this;
  var orig = _.cloneDeep(song);
  var origInterpeted = _.cloneDeep(sequencer.interpreted);
  vm.song = song;
  vm.song.tags = vm.song.tags || [];

  vm.tracks = _.cloneDeep(vm.song.tracks);
  vm.tracks.forEach((t, i) => t.originalIndex = i);

  vm.deleteTrack = function (index) {
    vm.tracks.splice(index, 1);
    vm.song.tracks = _.cloneDeep(vm.tracks);
  }

  vm.moved = function(index) {
    vm.tracks.splice(index, 1);
    vm.song.tracks = _.cloneDeep(vm.tracks);
    sequencer.reorder(vm.song.tracks);
    vm.tracks = _.cloneDeep(vm.song.tracks);
  }

  vm.cancel = function () {
    _.extend(vm.song, orig);
    vm.song.tracks = orig.tracks;
    sequencer.interpreted = origInterpeted;
    sequencer.reorder(vm.song.tracks);
    $mdDialog.cancel();
  };

  vm.save = function () {

    var payload = {
      tracks: []
    };
    for (var key in song) {
      if (key !== 'tracks' && key !== 'parts' && song.hasOwnProperty(key)) {
        payload[key] = song[key];
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
    console.log(payload);
    storeService.save(payload).then(function (result) {
      console.log(result);
    });
    $mdDialog.hide();
  };

}
