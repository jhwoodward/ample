
module.exports = function (ngModule) {

  ngModule.directive('pianoRollHoriz', ['$compile', '$timeout', function ($compile, $timeout) {
    return {
      restrict: 'E',
      replace: true,
      template: require('./piano-roll-horiz.html'),
      scope: {
        sequencer: '='
      },
      bindToController: true,
      controller: ['$scope', '$timeout', controller],
      controllerAs: 'vm',
      link: link
    };

    function link(scope, el, attr, vm) {


      scope.$watch('vm.sequencer', function (seq) {
        if (seq) {
          seq.subscribe(handler);
        }
      });

      var width = el[0].offsetWidth - 100;
      function handler(event) {
        if (event.type === 'ready' || event.type === 'solo') {
          handleReady(event);
        }

        if (event.type === 'start') {
          width = el[0].offsetWidth - 100;
          el[0].scrollLeft = 0;
        }

        if (event.type === 'stop') {
          vm.data.filter(e => e.active = false);
          vm.beats.forEach(beat => beat.active = false);
        }

        if (event.type === 'tick' ) {
          if (event.tick % 48 === 0 && event.tick > width && event.tick > width) {
            el[0].scrollLeft = event.tick - width;
          }
          $timeout(function () {
            scope.$apply(function () {
              vm.data.filter(e => e.on === event.tick).map(n => n.active = true);
              vm.data.filter(e => e.off === event.tick).map(n => n.active = false);
              vm.beats.forEach(beat => {
                beat.active = beat.count === Math.floor(event.tick / 48);
              });
            });
          });
        }

        if (event.type === 'markers') {
          updateMarkers(event);
        }


      }

      function updateMarkers(event) {

        $timeout(function () {
          scope.$apply(function () {
            vm.markers = event.markers;
            if (!vm.beats) {
              var beats = [];
              var beatCount = -1;
              for (var tick = 0; tick <= event.end; tick++) {
                if (tick % 48 === 0) {
                  beatCount++;
                  beats.push({ count: beatCount });
                }
              }
              vm.beats = beats;
            }

          });
        });

      }

      function handleReady(event) {

        console.time('piano roll render');

        var data = [];

        var highestPitch = 0;
        var lowestPitch = 127;

        event.tracks.forEach(track => {
          if (vm.sequencer.solo && vm.sequencer.solo !== track.key) return;

          var noteons = track.interpreted.events.filter(e => e.type === 'noteon');
          var noteoffs = track.interpreted.events.filter(e => e.type === 'noteoff');

          noteons.forEach(on => {

            for (var i = 0; i < noteoffs.length; i++) {
              var off = noteoffs[i];
              if (off.pitch.value === on.pitch.value) {
                if (on.pitch.value > highestPitch) {
                  highestPitch = on.pitch.value;
                }
                if (on.pitch.value < lowestPitch) {
                  lowestPitch = on.pitch.value;
                }
                data.push({
                  track: on.track.index + 1,
                  pitch: 127 - on.pitch.value,
                  on: on.tick,
                  off: off.tick,
                  duration: off.duration,
                  meta: { on, off }
                });
                noteoffs.splice(i, 1);
                on.matched = true;
                break;
              }
            }
          });
        });


        var height = el[0].offsetHeight - 100;
        var scaleFactor = height / (highestPitch - lowestPitch);
        var offset = ((127 - highestPitch) * scaleFactor) - 40;
        data = data.map(note => {
          note.top = (note.pitch * scaleFactor) - offset;
          note.height = scaleFactor > 20 ? 20 : scaleFactor;
          note.width = note.duration;
          return note;
        });



        var beats = [];
        var beatCount = -1;
        for (var key in vm.sequencer.events) {
          if (key % 48 === 0) {
            beatCount++;
            beats.push({ count: beatCount });
          }
        }

        $timeout(function () {
          scope.$apply(function () {
            vm.data = data;
            vm.beats = beats;
          });
        });

        console.timeEnd('piano roll render');

      }
    }
  }]);



  function controller($scope, $timeout) {
    var vm = this;
    vm.data = [];

    vm.hoverNote = function (note) {
      vm.sequencer.trigger(note.meta.on);
      note.active = true;
      $timeout(function () {
        note.active = false;
        vm.sequencer.trigger(note.meta.off);
      }, note.meta.off.duration * vm.sequencer.interval);
    }
  }

}
