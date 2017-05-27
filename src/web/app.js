require('angular');
require('angular-animate');
require('angular-messages');
require('angular-sanitize');
require('@uirouter/angularjs');
require('angular-aria');
require('angular-material');
require('angular-drag-and-drop-lists');
require('angular-ui-codemirror');
require('./main/codemirror/note-script');
require('./main/codemirror/track-script');
require('./main/codemirror/master-track-script');
require('angular-material/angular-material.css');

let mainModule = angular.module('mainModule', []);
require('./main/main.controller')(mainModule);
require('./main/edit.controller')(mainModule);
require('./main/log/piano-roll')(mainModule);
require('./main/log/piano-keys')(mainModule);
require('./main/log/piano-roll-horiz')(mainModule);
require('./main/log/info-log')(mainModule);
require('./main/log/draggable')(mainModule);
require('./main/track/track')(mainModule);
require('./main/track/tracks')(mainModule);
require('./main/options')(mainModule);
require('./main/track/master-track')(mainModule);
require('./main/webmidi.service')(mainModule);
require('./main/padZeros.filter')(mainModule);

let userModule = angular.module('userModule', []);
require('./user/user.service')(userModule);
require('./user/signup.controller')(userModule);
require('./user/login.controller')(userModule);

let storeModule = angular.module('storeModule', []);
require('./store/store.service')(storeModule);
require('./store/store')(storeModule);
require('./store/song-list')(storeModule);

let tutorialModule = angular.module('tutorialModule', []);
require('./tutorial/notation.controller')(tutorialModule);

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

let app = angular.module('app', ['ngAnimate', 'ngMessages', 'ngSanitize', 'ngMaterial', 'dndLists', 'ui.router', 'ui.codemirror', 'sharedModule', 'storeModule','tutorialModule', 'userModule', 'mainModule']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$mdThemingProvider','$mdInkRippleProvider',
  function ($stateProvider, $urlRouterProvider, $locationProvider, $mdThemingProvider,$mdInkRippleProvider) {

    $mdInkRippleProvider.disableInkRipple();

/*
    // Extend the red theme with a different color and make the contrast color black instead of white.
    // For example: raised button text will be black instead of white.
    var neonRedMap = $mdThemingProvider.extendPalette('red', {
      '500': '#ff0000',
      'contrastDefaultColor': 'dark'
    });

    // Register the new color palette map with the name <code>neonRed</code>
    $mdThemingProvider.definePalette('neonRed', neonRedMap);

    // Use that theme for the primary intentions
    $mdThemingProvider.theme('default')
      .primaryPalette('neonRed');
*/  
/*
$mdThemingProvider.definePalette('amazingPaletteName', {
    '50': 'ffebee',
    '100': 'ffcdd2',
    '200': 'ef9a9a',
    '300': 'e57373',
    '400': 'ef5350',
    '500': 'f44336',
    '600': 'e53935',
    '700': 'd32f2f',
    '800': 'c62828',
    '900': 'b71c1c',
    'A100': 'ff8a80',
    'A200': 'ff5252',
    'A400': 'ff1744',
    'A700': 'd50000',
    'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                        // on this palette should be dark or light

    'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
     '200', '300', '400', 'A100'],
    'contrastLightColors': undefined    // could also specify this if default was 'dark'
  });

  $mdThemingProvider.theme('default')
    .primaryPalette('amazingPaletteName')
*/

 var blueGrey2 = $mdThemingProvider.extendPalette('blue-grey', {
      'contrastDefaultColor': 'light'
    });

    // Register the new color palette map with the name <code>neonRed</code>
    $mdThemingProvider.definePalette('blue-grey2', blueGrey2);

 $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey')
    .accentPalette('blue-grey2');


    $locationProvider.html5Mode(true);

    $stateProvider
      .state('root', {
        url: '',
        abstract: true,
        resolve: {
          webmidi: function (webMidiService) {
            return webMidiService.enable();
          }
        }
      })
      .state('root.new', {
        url: '/new',
        views: {
          'app@': {
            template: require('./main/main.html'),
            controller: 'mainController',
            controllerAs: 'vm',
          }
        },
        resolve: {
          song: function (storeService, $stateParams) {
            return storeService.new();
          }
        }
      })
      .state('root.main', {
        url: '/:owner/:key',
        views: {
          'app@': {
            template: require('./main/main.html'),
            controller: 'mainController',
            controllerAs: 'vm',
          }
        },
        resolve: {
          song: function (storeService, $stateParams) {
            return storeService.getOne($stateParams.key, $stateParams.owner);
          }
        }
      });

    $urlRouterProvider.otherwise('/new');
  }]);

require('./css/site.css');
require('./css/blackboard.css');
require('./css/track.css')

module.exports = app;