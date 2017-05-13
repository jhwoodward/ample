var _ = require('lodash');

module.exports = function (ngModule) {
  ngModule.controller('editController', ['$mdDialog', 'song', 'tracks', 'storeService', controller]);
}

function controller($mdDialog, song, tracks, storeService) {
  var vm = this;

  vm.song = song;
  vm.tracks = tracks;
  vm.trackNames = tracks.map(t => t.key);
  vm.song.tags = vm.song.tags || [];

  var orig = _.cloneDeep(song);

  vm.cancel = function () {
    _.extend(vm.song, orig);
    $mdDialog.cancel();
  };

  vm.save = function (answer) {
     storeService.save(vm.song).then(function (result) {
      console.log(result);
    });
    $mdDialog.hide(answer);
  };

}
