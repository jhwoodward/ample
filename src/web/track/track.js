var eventType = require('../../interpreter/constants').eventType;
var _ = require('lodash');
module.exports = function (ngModule) {

  ngModule.directive('track', [function () {
    return {
      restrict: 'E',
      replace: true,
      template: require('./track.html'),
      scope: {
        sequencer: '=',
        track: '=',
        trackIndex: '=',
        onEdit: '&'
      },
      bindToController: true,
      controller: ['$scope', '$timeout', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $timeout) {
    var vm = this;
    vm.channels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16];
    vm.showChannelDropdown = function ($mdMenu, ev) {
      $mdMenu.open(ev);
    };

    $scope.$watch('vm.track.isMuted', function (isMuted) {
      if (isMuted) {
        clearAllMarkers();
        if (subMarker) {
          subMarker.clear();
        }
        if (sustainMarker) {
          sustainMarker.clear();
        }
        vm.setActive(false);
      }
    });

    $scope.$watch('vm.sequencer', function (seq) {
      if (seq) {
        seq.subscribe(handler);
      }
    });

    //  http://codemirror.net/doc/manual.html#api_marker
    var markers = {};
    var subMarker, subMarker2
    var sustainMarker;

    function clearAllMarkers() {
      for (var key in markers) {
        markers[key].clear();
      }
      if (subMarker) { subMarker.clear(); subMarker = undefined; }
      if (subMarker2) { subMarker2.clear(); subMarker2 = undefined; }
      if (sustainMarker) { sustainMarker.clear(); sustainMarker = undefined; }
    }

    function handler(event) {
      // return;
      if (event.type === 'stop') {
        clearAllMarkers();

        vm.setActive(false);
        return;
      }

      //for reverse play fake noteoff
      if (event.type === 'noteoff') {
        vm.setActive(false);
        if (markers[event.onOrigin.start]) {
          markers[event.onOrigin.start].clear();
        }
      }

      if (event.type !== 'tick') return;

      event.events.sort(function (a, b) {
        if (a.type === eventType.substitutionEnd && b.type !== eventType.substitutionEnd) return -1;
        return 1;
      });

      event.events.forEach(e => {

        if (e.isMaster || (e.origin && e.origin.isMaster) || !e.track || e.track.key !== vm.track.key) return;

        //  console.time('get origin')
        if (e.origin) {
          var start = editor.posFromIndex(e.origin.start);
          var end = editor.posFromIndex(e.origin.end);
        }
        //  console.timeEnd('get origin');
        switch (e.type) {
          case eventType.substitution:
            if (subMarker) { subMarker.clear(); subMarker = undefined; }
            if (subMarker2) { subMarker2.clear(); subMarker2 = undefined; }
            subMarker = editor.markText(start, end, { className: 'sub-highlight' });

            if (e.subOrigin) {
              var substart = editor.posFromIndex(e.subOrigin.start);
              var subend = editor.posFromIndex(e.subOrigin.end);
              subMarker2 = editor.markText(substart, subend, { className: 'sub-highlight' });
            }
            break;
          case eventType.substitutionEnd:
            if (subMarker) { subMarker.clear(); subMarker = undefined; }
            if (subMarker2) { subMarker2.clear(); subMarker2 = undefined; }
            break;
          case eventType.sustain:
            if (sustainMarker) { sustainMarker.clear(); sustainMarker = undefined; }
            sustainMarker = editor.markText(start, end, { className: 'sustain-highlight' });
            break;
          case eventType.noteon:
            vm.setActive(true);
            if (sustainMarker) { sustainMarker.clear(); sustainMarker = undefined; }
            if (!e.origin) return;
            if (markers[e.origin.start]) {
              markers[e.origin.start].clear();
            }
            markers[e.origin.start] = editor.markText(start, end, { className: 'highlight' });

            break;
          case eventType.noteoff:
            if (!e.onOrigin) return;
            vm.setActive(false);
            if (markers[e.onOrigin.start]) {
              markers[e.onOrigin.start].clear();
              delete markers[e.onOrigin.start];
            }
            if (!e.origin) return;
            if (sustainMarker) { sustainMarker.clear(); sustainMarker = undefined; }
            sustainMarker = editor.markText(start, end, { className: 'sustain-highlight' });
            break;
        }


      });



    }

    vm.setActive = function (active) {
      $timeout(function () {
        $scope.$apply(function () {
          vm.active = active;
        });
      });
    }

    vm.selectChannel = function (channel) {
      vm.track.channel = channel - 1;
    }
    vm.options = {
      lineWrapping: true,
      lineNumbers: false,
      height: '100%',
      matchBrackets: true,
      mode: {
        name: 'track-script',
        viewportMargin: Infinity
      },
      theme: 'blackboard'
    };

    var editor;
    vm.codemirrorLoaded = function (ed) {
      editor = ed;
      /*
      var charWidth = editor.defaultCharWidth(), basePadding = 4;
      editor.on("renderLine", function (cm, line, elt) {
        var off = CodeMirror.countColumn(line.text, null, cm.getOption("tabSize")) * charWidth;
        elt.style.textIndent = "-" + off + "px";
        elt.style.paddingLeft = (basePadding + off) + "px";
      });
      editor.refresh();
      editor.focus();
*/
    };

    $scope.$watch('vm.track.part', _.debounce(function (val, old) {
      if (val && old && val !== old) {
        $timeout(function () {
          vm.sequencer.update(vm.track);
        });
      }
    }, 1000));

  }

}

