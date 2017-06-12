var macroType = require('../../interpreter/constants').macroType;
var Interpreter = require('../../interpreter/Interpreter');
var parsers = require('../../interpreter/parsers');
var parse = require('../../interpreter/parse');
var eventType = require('../../interpreter/constants').eventType;
var _ = require('lodash');

module.exports = function (ngModule) {

  ngModule.directive('editMacroList', [function () {
    return {
      restrict: 'E',
      replace: true,
      template: require('./edit-macro-list.html'),
      scope: {
        sequencer: '=',
        macroList: '=',
        panelIndex: '=',
        onClose: '&',
        onUpdate: '&'
      },
      bindToController: true,
      controller: ['$scope', '$timeout', 'userService', controller],
      controllerAs: 'vm'
    }
  }]);

  function controller($scope, $timeout, userService) {
    var vm = this;

    $scope.$watch('vm.macroList', activate);

    $scope.$watch('vm.sequencer', function (seq) {
      if (seq) {
        seq.subscribe(handler);
      }
    });

    function activate(macroList) {
      if (!macroList) return;
      macroList.part = macroList.macros.reduce((acc, macro) => {

        switch (macro.type) {
          case macroType.annotation:
            acc += '{' + macro.key + '} = {' + macro.value + '}';
            break;
          case macroType.substitution:
            acc += macro.key + ' = (' + macro.value + ')';
            break;
        }

        acc += '\n\n';

        return acc;


      }, '');
    }

    $scope.$watchCollection('vm.macroList.macros', function (macros) {
      if (macros === undefined) return;
      doc.macros = macros;

      vm.part = vm.macroList.part;
    });


    $scope.$watch('vm.part', _.debounce(function (val, old) {
      if (val && old && val !== old) {
        $timeout(function () {

          vm.macroList.part = vm.part;
          var source = (vm.macroList.owner || userService.user.key) + '/' + vm.macroList.key;
          var interpreter = new Interpreter();
          interpreter.generateState(parse(parsers.setter, vm.macroList.part, [], 0, vm.panelIndex));
          //vm.macroList.macros = interpreter.parseMacros(vm.macroList.part, parsers.main);
          vm.macroList.macros = interpreter.macros.filter(m => m.value !== undefined).map(m => {
            m.source = source;
            m.panelIndex = vm.panelIndex;
            return m;
          });
          vm.onUpdate({ macroList: vm.macroList });

        });
      }
    }, 1000));

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

        //if (e.isMaster || (e.origin && e.origin.isMaster) || !e.track || e.track.key !== vm.track.key) return;

        if (e.isMaster) return;
        if (e.origin && e.origin.panelIndex !== vm.panelIndex) return;



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

    var editor, doc;
    vm.codemirrorLoaded = function (ed) {
      editor = ed;
      doc = editor.getDoc();
    };




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



  }

}

