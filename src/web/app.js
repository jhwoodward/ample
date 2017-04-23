require('angular');
require('angular-route');
require('angular-animate');
require('angular-messages');
require('angular-sanitize');

require('angular-ui-codemirror');

let demoModule = angular.module('demoModule', []);
require('./demo/demo.controller')(demoModule);

let coreModule = angular.module('coreModule', []);
coreModule.directive('unload', ['$timeout', function ($timeout) {
    return {
      restrict: 'A',
      link: function ($scope, element, attrs) {
        $timeout(function () {
          element.addClass("loaded");
        });
      }
    }
  }]);



let app = angular.module('app', ['ngRoute', 'ngAnimate','ngMessages','ngSanitize', 'ui.codemirror', 'coreModule', 'demoModule']);

app.config(['$routeProvider', '$locationProvider',
    function ($routeProvider, $locationProvider) {
        
        $locationProvider.html5Mode(true);
        
        $routeProvider
          .when('/', {
            template: require('./demo/demo.html'),
            controller: 'demoController',
            controllerAs: 'vm'
        }).otherwise({
            redirectTo:'/'
        });
    }]);
    
//global.jQuery = global.$ = require('jquery');
//require('bootstrap');
//require('./css/animate.css');
//require('./css/animations.css');
require('./css/site.css');

//require('jquery.easing');

module.exports = app;