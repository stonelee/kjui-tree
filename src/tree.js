define(function(require, exports, module) {
  var $ = require('$'),
    Widget = require('widget'),
    handlebars = require('handlebars'),
    _ = require('underscore');

  var treeTpl = require('./tree.tpl'),
    rowTpl = require('./row.tpl');

  var Tree = Widget.extend({
    attrs: {
      url: '',
      data: [],

      title: '',
      fields: [],

      showRoot: true,
      children: 'children',
      multiSelect: false,
      cascade: false,

      width: 0,
      height: 0
    },

    _onRenderUrl: function(url) {
      var self = this;
      $.getJSON(url, function(data) {
        self._createTree(data.data);
      });
    },
    _onRenderData: function(data) {
      this._createTree(data);
    },

    _createTree: function(data) {
      this.data = data;

      var gridWidth = this.get('width') || this.element.parent().width();
      var fields = this._processField(gridWidth);
      var gridHeight = this.get('height');
      var html = handlebars.compile(treeTpl)({
        width: gridWidth,
        height: gridHeight,

        title: this.get('title'),
        fields: fields
      });

      this.element.html(html);

      this._tree = this.$('.grid-no-border tbody');
      if (this.get('showRoot')) {
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
          $row.find('.icon-tree-leaf,.icon-tree-folder').css('background', 'url("' + icon + '")');
        }
      });

      //已选择的行
      if (this.get('multiSelect')) {
        this.$('.icon-tree-leaf,.icon-tree-folder').before($('<input type="checkbox" data-role="check">'));
        this.selected = [];
      } else {
        this.selected = null;
      }

      //自适应高度
      if (!gridHeight) {
        gridHeight = this.element.height() - this.$('.grid-bd').position().top - 1;
        this.$('.grid-bd').height(gridHeight);
      }

      this.trigger('rendered', this);
    },
    _processField: function(gridWidth) {
      var fields = this.get('fields');
      if (!fields) return [];

      var specWidth = 0,
        specNum = 0;
      $.each(fields, function() {
        if (this.width) {
          specWidth += this.width;
          specNum += 1;
        }
      });

      //padding-width + border-width = 9
      //滚动条宽度取18
      var leftWidth = gridWidth - fields.length * 9 - specWidth - 18;
      var averageWidth = leftWidth / (fields.length - specNum);

      fields = $.map(fields, function(field) {
        if (!field.width) {
          field.width = averageWidth;
        }
        return field;
      });
      this._fields = fields;
      return fields;
    },

    _loopRow: function(data, prefix) {
      var childrenName = this.get('children');

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
      var treeColumnWidth = 0;
      if (this._fields) {
        grids = $.map(this._fields, function(field) {
          if (field.name) {
            var value = data[field.name];
            value = _.escape(value);

            if ($.isFunction(field.render)) {
              value = field.render(value);
            }
            var f = _.clone(field);
            f.value = value;
            return f;
          } else {
            //没有设置name的列视为tree column
            if (field.width) {
              treeColumnWidth = field.width;
            }
          }
        });
      }

      var child = data[this.get('children')];
      var row = handlebars.compile(rowTpl)({
        id: data.id,
        treeColumnWidth: treeColumnWidth,
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
      var childName = this.get('children');

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
      var childrenName = this.get('children');
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
      $.each($row.data('data')[this.get('children')], function(index, data) {
        var $r = self.$('.grid-row[data-id=' + data.id + ']');
        $r.show();
        if ($r.attr('data-status') == 'expanded') {
          self._show($r);
        }
      });
    },
    _hide: function($row) {
      var self = this;
      $.each($row.data('data')[this.get('children')], function(index, data) {
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
        if (!this.get('multiSelect')) {
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
        if (this.get('cascade')) {
          $.each($row.data('children'), function(index, $r) {
            self.check($r);
          });
        }
      } else {
        this._unCheckRow($row);
        if (this.get('cascade')) {
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
      if (this.get('multiSelect')) return;

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
      this.$('.grid-bd').scrollTop($row.height() * index);

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
