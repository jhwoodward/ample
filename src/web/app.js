require('angular');
require('angular-animate');
require('angular-messages');
require('angular-sanitize');
require('@uirouter/angularjs');
require('angular-aria');
require('angular-material');

require('angular-ui-codemirror');

require('angular-material/angular-material.css');
// Icons
//require('font-awesome/css/font-awesome.css');


let mainModule = angular.module('mainModule', []);
require('./main/main.controller')(mainModule);
require('./main/piano-roll')(mainModule);
require('./main/track')(mainModule);

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

let app = angular.module('app', ['ngAnimate', 'ngMessages', 'ngSanitize', 'ngMaterial', 'ui.router', 'ui.codemirror', 'sharedModule', 'storeModule', 'mainModule']);

app.config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('root', {
        url: '/:key',
        template: require('./main/main.html'),
        controller: 'mainController',
        controllerAs: 'vm',
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
      $urlRouterProvider.otherwise('/');
  }]);

require('./css/site.css');
require('./css/blackboard.css')


module.exports = app;