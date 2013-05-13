define("kjui/tree/1.1.0/tree-debug", ["$-debug", "kjui/grid/1.3.0/grid-debug", "arale/widget/1.0.4/widget-debug", "arale/base/1.0.1/base-debug", "arale/class/1.0.0/class-debug", "arale/events/1.0.0/events-debug", "arale/widget/1.0.4/templatable-debug", "gallery/handlebars/1.0.1/handlebars-debug", "gallery/underscore/1.4.2/underscore-debug"], function(require, exports, module) {
  var $ = require('$-debug'),
    Grid = require('kjui/grid/1.3.0/grid-debug'),
    Handlebars = require('gallery/handlebars/1.0.1/handlebars-debug'),
    _ = require('gallery/underscore/1.4.2/underscore-debug');

  var rowTpl = '<tr class="grid-row" data-id="{{id}}" {{#if expanded}}data-status="expanded"{{/if}} {{#if leaf}}data-role="leaf"{{else}}data-role="expander"{{/if}}> <td class="grid-cell"> {{#each icons}}<i class="icon-tree-{{this}}"></i>{{/each}}<span data-role="text" style="cursor:pointer;" class="unselectable">{{name}}</span> </td> {{#each grids}} <td class="grid-cell"{{#if align}} style="text-align:{{align}};"{{/if}}> {{{value}}} </td> {{/each}} </tr>';

  var Tree = Grid.extend({
    model: {
      paginate: false,

      showRoot: true,
      children: 'children',
      multiSelect: false,
      cascade: false
    },

    setup: function() {
      this.$('.grid-view table').addClass('grid-no-border');

      Tree.superclass.setup.call(this);
    },

    _loadData: function(data) {
      this.data = data;

      this._tree = this.$('.grid-no-border tbody');
      if (this.model.showRoot) {
        this._createRow(['elbow-end-minus', 'folder'], data);
        this._loopRow(data, ['elbow-empty']);
      } else {
        this._loopRow(data, []);
      }
      this._processData();

      //更改icon
      this.$('.grid-row').each(function(index, row) {
        var $row = $(row);
        var icon = $row.data('data').icon;
        if (icon) {
          $row.find('.icon-tree-leaf,.icon-tree-folder').css('background', 'url("' + icon + '") no-repeat 0 0');
        }
      });

      //已选择的行
      if (this.model.multiSelect) {
        this.$('.icon-tree-leaf,.icon-tree-folder').before($('<input type="checkbox" data-role="check">'));
        this.selected = [];
      } else {
        this.selected = null;
      }

      this.trigger('loaded');
    },

    _loopRow: function(data, prefix) {
      var childrenName = this.model.children;

      var child = data[childrenName];
      for (var i = 0; i < child.length; i++) {
        var d = child[i];
        if (d[childrenName].length === 0) {
          if (i != child.length - 1) {
            this._createRow(prefix.concat('elbow', 'leaf'), d);
          } else {
            this._createRow(prefix.concat('elbow-end', 'leaf'), d);
          }
        } else {
          if (i != child.length - 1) {
            this._createRow(prefix.concat('elbow-minus', 'folder'), d);
          } else {
            this._createRow(prefix.concat('elbow-end-minus', 'folder'), d);
          }
          if (i != child.length - 1) {
            this._loopRow(d, prefix.concat('elbow-line'));
          } else {
            this._loopRow(d, prefix.concat('elbow-empty'));
          }
        }
      }
    },

    _createRow: function(icons, data) {
      var grids = [];
      if (this.model.fields) {
        grids = $.map(this.model.fields, function(field) {
          if (field.name) {
            var value = data[field.name];
            value = _.escape(value);

            if ($.isFunction(field.render)) {
              value = field.render(value);
            }
            var f = _.clone(field);
            f.value = value;
            return f;
          }
        });
      }

      var child = data[this.model.children];
      var row = Handlebars.compile(rowTpl)({
        id: data.id,
        icons: icons,
        name: data.name,
        expanded: child.length !== 0 ? true : false,
        leaf: child.length === 0 ? true : false,
        grids: grids
      });
      var $row = $(row);
      $row.data('data', data);
      this._tree.append($row);
    },

    //将关系保存在data中
    _processData: function() {
      var self = this;
      var childName = this.model.children;

      this.$('.grid-row').each(function(index, row) {
        var $row = $(row);
        var dataList = $row.data('data')[childName];
        $.each(dataList, function(i, data) {
          var $r = self.$('.grid-row[data-id=' + data.id + ']');
          $r.data('parent', $row);

          $r.data('siblings', self._getSiblings(data.id, dataList));
        });

        var children = [];
        self._getChildren($row.data('data'), children);
        $row.data('children', children);
      });

      //设置第一层级siblings
      this.$('.grid-row').each(function(index, row) {
        var $row = $(row);
        if (!$row.data('parent')) {
          $row.data('siblings', self._getSiblings($row.data('data').id, self.data[childName]));
        }
      });
    },
    _getChildren: function(data, children) {
      var self = this;
      var childrenName = this.model.children;
      $.each(data[childrenName], function(index, d) {
        var $row = self.$('.grid-row[data-id=' + d.id + ']');
        children.push($row);
        if (d[childrenName].length > 0) {
          self._getChildren(d, children);
        }
      });
    },
    _getSiblings: function(id, children) {
      var self = this;
      var lst = [];
      $.each(children, function(i, d) {
        if (d.id !== id) {
          lst.push(self.$('.grid-row[data-id=' + d.id + ']'));
        }
      });
      return lst;
    },

    events: {
      'click [class$=-minus],[class$=-plus]': '_toggle',
      'dblclick  [data-role=expander] [data-role=text]': '_toggle',
      'click .grid-row': '_click',
      'click [data-role=check]': '_check'
    },

    _toggle: function(e) {
      var $target = $(e.target);
      var $row = $target.parents('tr');
      if ($row.attr('data-status') == 'expanded') {
        this.shrink($row);
      } else {
        this.expand($row);
      }
    },
    expand: function($row) {
      this._show($row);
      this._changeIcon($row, 'plus', 'minus');
      $row.attr('data-status', 'expanded');
    },
    shrink: function($row) {
      this._hide($row);
      this._changeIcon($row, 'minus', 'plus');
      $row.removeAttr('data-status');
    },

    _changeIcon: function($row, old, other) {
      var $i = $row.find('[class$=-' + old + ']');
      var cls = $i.attr('class');
      cls = cls.replace(old, other);
      $i.attr('class', cls);
    },
    _show: function($row) {
      var self = this;
      $.each($row.data('data')[this.model.children], function(index, data) {
        var $r = self.$('.grid-row[data-id=' + data.id + ']');
        $r.show();
        if ($r.attr('data-status') == 'expanded') {
          self._show($r);
        }
      });
    },
    _hide: function($row) {
      var self = this;
      $.each($row.data('data')[this.model.children], function(index, data) {
        var $r = self.$('.grid-row[data-id=' + data.id + ']');
        $r.hide();
        if ($r.attr('data-role') == 'expander' && $r.attr('data-status') == 'expanded') {
          self._hide($r);
        }
      });
    },

    _click: function(e) {
      var $target = $(e.target);
      var $row = $target.parents('tr');
      var data = $row.data('data');

      if (!/minus|plus/.test($target.attr('class'))) {
        if (!this.model.multiSelect) {
          if (this.selected && this.selected.data('data').id === data.id) {
            this.selected = null;
            $row.removeClass('grid-row-is-selected');
          } else {
            this.selected = $row;
            $row.addClass('grid-row-is-selected').siblings().removeClass('grid-row-is-selected');
          }
        }

        if ($target.attr('data-role') != 'check') {
          this.trigger('click', $target, data);
        }
      }
    },

    _check: function(e) {
      var self = this;
      var $target = $(e.target);
      var $row = $target.parents('tr');

      if ($target.prop('checked')) {
        this._checkRow($row);
        if (this.model.cascade) {
          $.each($row.data('children'), function(index, $r) {
            self.check($r);
          });
        }
      } else {
        this._unCheckRow($row);
        if (this.model.cascade) {
          $.each($row.data('children'), function(index, $r) {
            self.unCheck($r);
          });
        }
      }
    },
    _checkRow: function($row) {
      this.selected.push($row);
      $row.addClass('grid-row-is-selected');
    },
    _unCheckRow: function($row) {
      var id = $row.data('data').id;
      for (var i = this.selected.length - 1; i >= 0; i--) {
        if (this.selected[i].data('data').id === id) {
          this.selected.splice(i, 1);
        }
      }
      $row.removeClass('grid-row-is-selected');
    },

    check: function($row) {
      var $check = $row.find('[data-role=check]');
      if (!$check) return;

      if (!$check.prop('checked')) {
        this._checkRow($row);
        $check.prop('checked', true);
      }
    },
    unCheck: function($row) {
      var $check = $row.find('[data-role=check]');
      if (!$check) return;

      if ($check.prop('checked')) {
        this._unCheckRow($row);
        $check.prop('checked', false);
      }
    },

    select: function($row) {
      //暂不支持多选
      if (this.model.multiSelect) return;

      //父节点张开
      var parentRow = $row.data('parent');
      while (parentRow) {
        if (parentRow.attr('data-status') != 'expanded') {
          this.expand(parentRow);
        }
        parentRow = parentRow.data('parent');
      }

      //选中
      this.selected = $row;
      $row.addClass('grid-row-is-selected').siblings().removeClass('grid-row-is-selected');

      //滚动到所选内容
      var index = $row.parent().children(':visible').index($row);
      this.$('.grid-view').scrollTop($row.height() * index);

      var data = $row.data('data');
      this.trigger('click', $row, data);
    },

    refresh: function() {
      //刷新往往不会改变url
      var url = this.get('url');
      this._onRenderUrl(url);
    }

  });

  module.exports = Tree;

});
