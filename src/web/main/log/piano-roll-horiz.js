var eventType = require('../../../interpreter/constants').eventType;

module.exports = function (ngModule) {

  ngModule.directive('pianoRollHoriz', ['$compile', '$timeout', function ($compile, $timeout) {
    return {
      restrict: 'E',
      replace: true,
      template: require('./piano-roll-horiz.html'),
      scope: {
        sequencer: '=',
        active: '='
      },
      bindToController: true,
      controller: ['$scope', '$timeout', controller],
      controllerAs: 'vm',
      link: link
    };

    function link(scope, el, attr, vm) {

      var currentEvent;
      var width = el[0].offsetWidth - 250;

      /*
            var cssTransform = (function () {
              var prefixes = 'transform webkitTransform mozTransform oTransform msTransform'.split(' ')
                , el = document.createElement('div')
                , cssTransform
                , i = 0
              while (cssTransform === undefined) {
                cssTransform = document.createElement('div').style[prefixes[i]] != undefined ? prefixes[i] : undefined
                i++
              }
              return cssTransform
            })();
      
            var p = document.getElementById('pianoroll');
      
            function setLeft() {
              p.style['transition'] = 'transform ' + (480) + 'ms';
              p.style[cssTransform] = "translate3d(" + (width - currentEvent.tick) + "px, 0 ,0)"
      
            }
      
          
            function scroll() {
              if (currentEvent && currentEvent.tick > width && currentEvent.tick % 48 === 0) {
                setLeft();
              }
            //  window.requestAnimationFrame(scroll);
            }
      
          //  window.requestAnimationFrame(scroll);
      */

      vm.onDragBeatMarker = function(tick) {
        if (!tick) return;
        vm.sequencer.tick = tick + el[0].scrollLeft;
        scope.$digest();
      }


      function scroll() {
        if (vm.active) {
          if (currentEvent && currentEvent.tick > width) {
            el[0].scrollLeft = Math.round(currentEvent.tick - width);
          }
        }

        window.requestAnimationFrame(scroll);
      }

      window.requestAnimationFrame(scroll);

      scope.$watch('vm.sequencer', function (seq) {
        if (seq) {
          seq.subscribe(handler);
        }
      });


      function off() {
        vm.data.forEach(e => e.active = false);
        if (vm.beats) vm.beats.forEach(beat => beat.active = false);
      }

      scope.$watch('vm.active', function (active) {
        if (!active) off();
      });

      function handler(event) {

        currentEvent = event;

        if (!vm.active) return;


        if (event.type === 'ready' || event.type === 'solo' || event.type === 'mute') {
          handleReady(event);
        }

        if (event.type === 'start') {
          width = el[0].offsetWidth - 250;
          el[0].scrollLeft = 0;
        }

        if (event.type === 'stop') {
          off();
        }

        if (event.type === 'tick') {
          //scroll();
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

        event.tracks.forEach((track, i) => {

          var interpreted = event.interpreted[i];
          if (!interpreted) return;

          if (vm.sequencer.solo && vm.sequencer.solo !== track.key) return;
          if (!vm.sequencer.solo && track.isMuted) return;

          var noteons = interpreted.events.filter(e => e.type === eventType.noteon);
          var noteoffs = interpreted.events.filter(e => e.type === eventType.noteoff);

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
                  track: on.trackIndex + 1,
                  pitch: 127 - on.pitch.value,
                  on: on.tick,
                  off: off.tick,
                  duration: off.duration || (off.tick - on.tick),
                  meta: { on, off },
                  ornament: on.ornament
                });
                noteoffs.splice(i, 1);
                on.matched = true;
                break;
              }
            }
          });
        });


        var height = el[0].offsetHeight - 50;
        var scaleFactor = Math.round(height / (highestPitch - lowestPitch));
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
    vm.beats = [];
    vm.hoverNote = function (note) {
      vm.sequencer.trigger(note.meta.on);
      note.active = true;
      $timeout(function () {
        note.active = false;
        vm.sequencer.trigger(note.meta.off);
      }, note.meta.off.duration * vm.sequencer.interval * 10);
    }
  }

}
