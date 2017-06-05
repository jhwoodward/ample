module.exports = function (ngModule) {

  ngModule.directive('ngDrag', [function () {
    return {
      scope: {
        ngDrag: '&'
      },
      restrict: 'A',
      link: function (scope, el, attrs, controller) {
      
        angular.element(el).attr("draggable", "true");
        el.bind('dragstart', function (e) {
          var crt = document.createElement('div');
          crt.style.display = 'none';
          document.body.appendChild(crt);
          e.dataTransfer.setDragImage(crt, 0, 0);

          el[0].setAttribute('dragging', true);
        });
        el.bind("drag", function (e) {
          scope.ngDrag({ tick: e.clientX });
        });

        el.bind("dragend", function (e) {
          scope.ngDrag({ tick: e.clientX });
           el[0].removeAttribute('dragging');
        });
      }
    }
  }]);

}