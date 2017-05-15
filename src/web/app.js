require('angular');
require('angular-animate');
require('angular-messages');
require('angular-sanitize');
require('@uirouter/angularjs');
require('angular-aria');
require('angular-material');
require('angular-drag-and-drop-lists');
require('angular-ui-codemirror');

require('angular-material/angular-material.css');
// Icons
//require('font-awesome/css/font-awesome.css');

let mainModule = angular.module('mainModule', []);
require('./main/main.controller')(mainModule);
require('./main/edit.controller')(mainModule);
require('./main/log/piano-roll')(mainModule);
require('./main/log/piano-keys')(mainModule);
require('./main/log/piano-roll-horiz')(mainModule);
require('./main/log/info-log')(mainModule);
require('./main/track')(mainModule);
require('./main/master-track')(mainModule);
require('./main/webmidi.service')(mainModule);


let storeModule = angular.module('storeModule', []);
require('./store/store.service')(storeModule);
require('./store/store')(storeModule);

let sharedModule = angular.module('sharedModule', []);
sharedModule.directive('unload', ['$timeout', function ($timeout) {
  return {
    restrict: 'A',
    link: function ($scope, element, attrs) {
      $timeout(function () {
        element.addClass("loaded");
      });
    }
  }
}]);

let app = angular.module('app', ['ngAnimate', 'ngMessages', 'ngSanitize', 'ngMaterial',  'dndLists','ui.router', 'ui.codemirror', 'sharedModule', 'storeModule', 'mainModule']);

app.config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('root', {
        url: '',
        abstract:true,
        resolve: {
          webmidi: function (webMidiService) {
            return webMidiService.enable();
          }
        }
      })
      .state('root.main', {
        url: '/main/:key',
        views: {
          'app@': {
            template: require('./main/main.html'),
            controller: 'mainController',
            controllerAs: 'vm',
          }
        },
        params: {
          key: null
        },
        resolve: {
          song: function (storeService, $stateParams) {

            if (!$stateParams.key) {
              return storeService.new();
            } else {
              return storeService.getOne($stateParams.key);
            }

          }
        }
      });

    $urlRouterProvider.otherwise('/main/');
  }]);

require('./css/site.css');
require('./css/blackboard.css')


module.exports = app;