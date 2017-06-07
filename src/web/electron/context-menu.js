
module.exports = function (ngModule) {

  ngModule.directive('contextMenu', ['currentWindow', 'Menu', 'MenuItem', function (currentWindow, Menu, MenuItem) {
    
    return {
      restrict: 'E',
      link: linkFn
    }

    function linkFn() {

        if (currentWindow) {
  
    let rightClickPosition = null
    const menu = new Menu()
    const menuItem = new MenuItem({
      label: 'Inspect Element',
      click: () => {
        currentWindow.inspectElement(rightClickPosition.x, rightClickPosition.y)
      }
    })
    menu.append(menuItem)

    window.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      rightClickPosition = {x: e.x, y: e.y}
      menu.popup(currentWindow)
    }, false)
  }

    }
    
  }]);


}
