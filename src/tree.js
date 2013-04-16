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

      this._tree = this.element.find('.grid-no-border tbody');
      this._loopRow(data, []);

      this.selected = null;

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
        treeColumnWidth: treeColumnWidth,
        icons: icons,
        name: data.name,
        expanded: data.children.length !== 0 ? true : false,
        leaf: data.children.length === 0 ? true : false,
        grids: grids
      });
      $row = $(row);
      $row.data('data', data);
      this._tree.append($row);
    },

    events: {
      'click .grid-row': '_click'
    },

    _click: function(e) {
      var $target = $(e.target);
      var $row = $target.parents('tr');
      var data = $row.data('data');

      if (/minus|plus/.test($target.attr('class'))) {
        //打开折叠
        this._toggle($target);
      } else {
        //点击事件
        if (this.selected && this.selected.data('data').id === data.id) {
          this.selected = null;
          $row.removeClass('grid-row-is-selected');
        } else {
          this.selected = $row;
          $row.addClass('grid-row-is-selected').siblings().removeClass('grid-row-is-selected');
        }

        //参数为点击项对应节点，数据
        this.trigger('click', $target, data);
      }
    },

    _toggle: function(node) {
      var index = node.parent().children().index(node);
      var row = node.parents('tr');

      var cls = node.attr('class');
      if (/minus/.test(cls)) {
        cls = cls.replace('minus', 'plus');

        toggle('hide', row, index);
        row.removeAttr('data-status');
      } else if (/plus/.test(cls)) {
        cls = cls.replace('plus', 'minus');

        toggle('show', row, index);
        row.attr('data-status', 'expanded');
      } else {
        seajs.console('不合法的class');
      }
      node.attr('class', cls);
    }

  });

  module.exports = Tree;

  function toggle(type, row, index) {
    var nextRow = row.next();
    var nextNode = nextRow.children().eq(0).children().eq(index);
    if (nextNode.hasClass('icon-tree-elbow-line') || nextNode.hasClass('icon-tree-elbow-empty')) {
      nextRow[type]();

      if (type == 'show') {
        if (nextRow.attr('data-type') == 'leaf') {
          toggle(type, nextRow, index);
        } else {
          if (nextRow.attr('data-status') == 'expanded') {
            toggle(type, nextRow, index);
          }
        }
      } else {
        toggle(type, nextRow, index);
      }
    }
  }

});
