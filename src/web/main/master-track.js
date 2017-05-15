var eventType = require('../../interpreter/constants').eventType;

module.exports = function (ngModule) {

  ngModule.directive('masterTrack', [function () {
    return {
      restrict: 'E',
      replace: true,
      template: require('./master-track.html'),
      scope: {
        sequencer: '=',
        master: '='
      },
      bindToController: true,
      controller: ['$scope', '$timeout', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $timeout) {
    var vm = this;

    var scaleMarker;
    var markerMarker;
    var subMarker;
    var sustainMarker;


    $scope.$watch('vm.sequencer', function (seq) {
      if (seq) {
        seq.subscribe(handler);
      }
    });

    function clearAllMarkers() {
      if (subMarker) { subMarker.clear(); }
      if (sustainMarker) { sustainMarker.clear(); }
      if (markerMarker) { markerMarker.clear(); }
      if (scaleMarker) { scaleMarker.clear(); }
    }

    function handler(event) {
      if (event.type === 'stop') {
        clearAllMarkers();
        return;
      }

      if (event.type !== 'tick') return;

      event.events.forEach(e => {
        if (!e.isMaster) return;
        console.log('master event');

        if (e.origin) {
          var start = editor.posFromIndex(e.origin.start);
          var end = editor.posFromIndex(e.origin.end);
        }

        switch (e.type) {
          case eventType.substitution:
            if (subMarker) { subMarker.clear(); }
            subMarker = editor.markText(start, end, { className: 'sub-highlight' });
            break;
          case eventType.substitutionEnd:
            if (subMarker) { subMarker.clear(); }
            break;
          case eventType.sustain:
            if (sustainMarker) { sustainMarker.clear(); }
            sustainMarker = editor.markText(start, end, { className: 'sustain-highlight' });
            break;
          case eventType.scale:
            if (scaleMarker) { scaleMarker.clear(); }
            scaleMarker = editor.markText(start, end, { className: 'highlight' });

            break;
          case eventType.marker:
            if (markerMarker) { markerMarker.clear(); }
            markerMarker = editor.markText(start, end, { className: 'sub-highlight' });

            break;

        }
      });



    }


    vm.options = {
      lineWrapping: true,
      lineNumbers: false,
      height: '100%',
      mode: {
        name: 'javascript',
        statementIndent: 2,
        json: true,
        viewportMargin: Infinity
      },
      theme: 'blackboard'
    };

    var editor;
    vm.codemirrorLoaded = function (ed) {
      editor = ed;
      var charWidth = editor.defaultCharWidth(), basePadding = 4;
      editor.on("renderLine", function (cm, line, elt) {
        var off = CodeMirror.countColumn(line.text, null, cm.getOption("tabSize")) * charWidth;
        elt.style.textIndent = "-" + off + "px";
        elt.style.paddingLeft = (basePadding + off) + "px";
      });
      editor.refresh();
      editor.focus();

    };

    $scope.$watch('vm.master.part', _.debounce(function (val, old) {
      if (val && old && val !== old) {
        vm.sequencer.updateMaster(vm.master);
      }
    }, 1000));


  }

}

