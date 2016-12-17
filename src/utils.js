var api = {
  loop: function(phrase, n) {
    var out = '';
    for (var i = 1;i<=n;i++) {
      out += phrase;
    }
    return out;
  },
  barRest: function(n) {
    n = n || 1;
    return api.loop('192,^', n);
  }
};

module.exports = api;