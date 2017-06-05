
module.exports = function (ngModule) {

  ngModule.directive('unload', ['$timeout', function ($timeout) {
    return {
      restrict: 'A',
      link: function ($scope, element, attrs) {
        $timeout(function () {
          element.addClass("loaded");
        });
      }
    }
  }]);

}