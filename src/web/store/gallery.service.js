module.exports = function (ngModule) {

  ngModule.factory("gallery", ['store', '$routeParams', '$location', function (store, $routeParams, $location) {

    Array.prototype.unique = function () {
      var a = this.concat();
      for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
          if (a[i] === a[j])
            a.splice(j--, 1);
        }
      }
      return a;
    };

    var Gallery = function (type, dataDefault) {

      this.type = type;
      this.store = store.create(type);
      this.dataDefault = dataDefault;
      this.current = {
        key: undefined,
        name: '',
        tags: [],
        screenshot: '',
        data: dataDefault
      };
      this.tags = [];//distinct tags
      this.lib = [];
      this.currentFilter;
      this.getlist();
    }

    Gallery.prototype = {
      save: function (cb) {
        this.store.save(this.current.key, this.current, function (d) {
          this.current.key = d.key;
          if (cb) {
            cb(this.current);
          }
        }.bind(this));
      },
      clone: function (cb) {
        this.current.key = undefined;
        this.save(function () {
          if (cb) {
            cb();
          }
        });
      },
      delete: function (key, cb) {
        this.store.delete(key, function () {
          if (cb) { cb(); }
          else {
            this.getlist()
          }
        }.bind(this));
      },
      getlist: function (cb) {
        this.store.getList(function (d) {//modify getlist to not return data - only tags and screenshot and name
          for (var i = 0; i < d.length; i++) {
            var tags = d[i].value.tags;
            if (tags) {
              this.tags = this.tags.concat(tags);
            }
            //map klee or lsystem to item
            if (d[i].value.joincolours) {
              d[i].value.data = d[i].value;
              d[i].value.name = d[i].value.title;
            }
            else if (d[i].value.klee) {
              d[i].value.data = d[i].value.klee;
              d[i].value.name = d[i].value.klee.title;
            }
            else if (d[i].value.lsystem) {
              d[i].value.data = d[i].value.lsystem;
              d[i].value.name = d[i].key;
            }

          }

          this.tags = this.tags.unique();

          //remove this reference and pass it in instead
          if ($location.search().tag || $routeParams.tag) {
            this.filterBy($location.search().tag || $routeParams.tag, cb);
          }
          else {
            this.lib = d;
            if (cb) { cb() }
          }

        }.bind(this));
      },
      filterBy: function (tag, cb) {

        this.store.getByTag(tag, function (d) {

          for (var i = 0; i < d.length; i++) {
            //map klee or lsystem to item

            if (d[i].value.joincolours) {
              d[i].value.data = d[i].value;
              d[i].value.name = d[i].value.title;
            }
            else if (d[i].value.klee) {
              d[i].value.data = d[i].value.klee;
              d[i].value.name = d[i].value.klee.title;
            }
            else if (d[i].value.lsystem) {
              d[i].value.data = d[i].value.lsystem;
              d[i].value.name = d[i].key;
            }
          }
          this.lib = d;
          this.currentFilter = tag;

          console.log(this.lib);

          if (!this.current.key) {
            this.load(this.lib[0].key);
          }

          if (cb) { cb() }

        }.bind(this));
      },
      toggleFilter: function (tag) {
        console.log(tag);
        console.log(this.currentFilter);
        if (this.currentFilter === tag) {
          this.currentFilter = undefined;
          this.store.getList(function (d) {
            this.lib = d;
          }.bind(this))
        }
        else {
          this.filterBy(tag);
        }

      },
      load: function (key, cb) {


        //load by key
        this.store.get(key, function (item) {

          if (item && item.value) {

            var data = {}
            var name = "";

            //mapping for legacy lsystem data structure
            if (item.value.lsystem) {
              data = {
                options: item.value.options,
                lsystem: item.value.lsystem,
                camera: item.value.camera
              }
              name = item.key;
            }
            else if (item.value.joincolours) {
              data = item.value;
              name = item.value.title;
            }
            else if (item.value.klee) {
              data = item.value.klee;
              name = item.value.klee.title;
            }
            else {
              data = item.value.data;
              name = item.name;
            }

            this.current = {
              key: item.key,
              name: name,
              tags: item.value.tags || [],
              data: $.extend({}, this.dataDefault, data)
            }
            if (cb) {
              cb(this.current.data);
            }
          }
        }.bind(this))
      },
      getCurrentIndex: function () {
        var currentIndex = -1;
        for (var i = 0; i < this.lib.length; i++) {
          if (this.current.key === this.lib[i].key) {
            currentIndex = i;
          }
        }
        return currentIndex;

      },
      getNextKey: function () {
        var i = this.getCurrentIndex();
        var newIndex = (i >= this.lib.length - 1 ? 0 : i + 1);
        if (this.lib[newIndex]) {
          return this.lib[newIndex].key;
        }
        else {
          return undefined;
        }

      },
      getPrevKey: function () {
        var i = this.getCurrentIndex();
        var newIndex = (i <= 0 ? this.lib.length - 1 : i - 1);
        if (this.lib[newIndex]) {
          return this.lib[newIndex].key;
        }
        else {
          return undefined;
        }
      },
      nextUrl: function () {
        return "/" + this.type + "/edit?key=" + this.getNextKey() + (this.currentFilter ? '&tag=' + this.currentFilter : '');
      },
      prevUrl: function () {
        return "/" + this.type + "/edit?key=" + this.getPrevKey() + (this.currentFilter ? '&tag=' + this.currentFilter : '');
      },
      loadNext: function (cb) {
        this.load(this.getNextKey(), cb);
      },
      loadPrev: function (cb) {
        this.load(this.getPrevKey(), cb);
      },
      galleryUrl: function () {
        return '/' + this.type + '/gallery' + (this.currentFilter ? '?tag=' + this.currentFilter : '');
      },
      editUrl: function () {
        return '/' + this.type + '/edit' + (this.currentFilter ? '?tag=' + this.currentFilter : '');
      },
      viewUrl: function () {
        return '/' + this.type + '/view' + (this.currentFilter ? '?tag=' + this.currentFilter : '');
      }
    };

    return {
      create: function (t, dataDefault) {
        return new Gallery(t, dataDefault);
      }
    }

  }]);

};