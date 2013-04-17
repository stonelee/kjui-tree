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

      multiSelect: false,
      cascade: false,

      width: 0,
      height: 0
    },

    _onRenderUrl: function(url) {
      var self = this;
      $.getJSON(url, function(data) {
        self._createTree(data);
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
      this._loopRow(data, []);
      this._processData();

      //已选择的行
      if (this.get('multiSelect')) {
        $('.icon-tree-leaf,.icon-tree-folder').before($('<input type="checkbox" data-role="check">'));
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
      for (var i = 0; i < data.children.length; i++) {
        var d = data.children[i];
        if (d.children.length === 0) {
          if (i != data.children.length - 1) {
            this._createRow(prefix.concat('elbow', 'leaf'), d);
          } else {
            this._createRow(prefix.concat('elbow-end', 'leaf'), d);
          }
        } else {
          if (i != data.children.length - 1) {
            this._createRow(prefix.concat('elbow-minus', 'folder'), d);
          } else {
            this._createRow(prefix.concat('elbow-end-minus', 'folder'), d);
          }
          if (i != data.children.length - 1) {
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
            field.value = value;

            return field;
          } else {
            //没有设置name的列视为tree column
            if (field.width) {
              treeColumnWidth = field.width;
            }
          }
        });
      }

      var row = handlebars.compile(rowTpl)({
        id: data.id,
        treeColumnWidth: treeColumnWidth,
        icons: icons,
        name: data.name,
        expanded: data.children.length !== 0 ? true : false,
        leaf: data.children.length === 0 ? true : false,
        grids: grids
      });
      var $row = $(row);
      $row.data('data', data);
      this._tree.append($row);
    },

    //将关系保存在data中
    _processData: function() {
      var self = this;
      this.$('.grid-row[data-role=expander]').each(function(index, row) {
        var $row = $(row);
        $.each($row.data('data').children, function(i, data) {
          self.$('.grid-row[data-id=' + data.id + ']').data('parent', $row);
        });

        var children = [];
        self._getChildren($row.data('data'), children);
        $row.data('children', children);
      });
    },
    _getChildren: function(data, children) {
      var self = this;
      $.each(data.children, function(index, d) {
        var $row = self.$('.grid-row[data-id=' + d.id + ']');
        children.push($row);
        if (d.children.length > 0) {
          self._getChildren(d, children);
        }
      });
    },

    events: {
      'click [class$=-minus],[class$=-plus]': '_toggle',
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
      $.each($row.data('data').children, function(index, data) {
        var $r = self.$('.grid-row[data-id=' + data.id + ']');
        $r.show();
        if ($r.attr('data-status') == 'expanded') {
          self._show($r);
        }
      });
    },
    _hide: function($row) {
      var self = this;
      $.each($row.data('data').children, function(index, data) {
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
        if (this.get('cascade') && $row.attr('data-role') == 'expander') {
          $.each($row.data('children'), function(index, $r) {
            self.check($r);
          });
        }
      } else {
        this._unCheckRow($row);
        if (this.get('cascade') && $row.attr('data-role') == 'expander') {
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
