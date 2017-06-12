
module.exports = function (ngModule) {

  ngModule.filter('import',[ 'userService', function (userService) {
    return function (imp) {
      if (!imp) return '';
      return imp.replace(userService.user.key+'/','')
    };
  }]);
}

