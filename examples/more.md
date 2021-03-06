# 更多

- order: 2

---

## 没有标题

````iframe:230
<style type="text/css">
  .panel-bd{
    border-top-width:1px;
  }
</style>

<script>
seajs.use(['tree'], function(Tree) {
  new Tree({
    url: './tree.json',
    model: {
      height: 200
    }
  }).render();
});
</script>
````

## 多选

````iframe:250
<script>
seajs.use(['tree'], function(Tree) {
  new Tree({
    url: './tree.json',
    model: {
      title: 'title',
      multiSelect: true,
      height: 200
    }
  }).render();
});
</script>
````

## 选中某一行

````iframe:300
<button id="select521">select 521</button>

<script>
seajs.use(['$','tree'], function($,Tree) {
  var tree = new Tree({
    url: './tree.json',
    model: {
      title: 'title',
      height: 200
    }
  }).render();

  $('#select521').click(function(){
    var $tr = tree.$('[data-id=521]');
    tree.select($tr);
  })

});
</script>
````

## 级联选择

````iframe:250
<script>
seajs.use(['tree'], function(Tree) {
  new Tree({
    url: './tree.json',
    model: {
      title: 'title',
      multiSelect: true,
      cascade: true,
      height: 200
    }
  }).render();
});
</script>
````

## 自定义关联选择（用于菜单管理）

````iframe:250
<script>
seajs.use(['$', 'tree'], function($, Tree) {
  new Tree({
    url: './tree.json',
    model: {
      title: 'title',
      multiSelect: true,
      cascade: true,
      height: 200
    },
    onLoaded: function(){
      function isOnlyChecked($row){
        var bool = true;
        $.each($row.data('siblings'), function(index, $r){
          var $check = $r.find('[data-role=check]');
          if ($check.prop('checked')){
            bool = false;
            return false;
          }
        });
        return bool;
      }

      var tree = this;
      this.delegateEvents('click [data-role=check]', function(e){
        var $target = $(e.target);
        var $row = $target.parents('tr');

        if ($target.prop('checked')) {
          //父节点全选中
          var parentRow = $row.data('parent');
          while (parentRow) {
            tree.check(parentRow);
            parentRow = parentRow.data('parent');
          }
        } else {
          //如果本层级没有其他项被选中，那么父节点取消选中
          var parentRow = $row.data('parent');
          while (parentRow) {
            if (!isOnlyChecked($row)) break;

            tree.unCheck(parentRow);
            $row = parentRow;
            parentRow = parentRow.data('parent');
          }
        }
      })
    }
  }).render();
});
</script>
````

## 更改children配置

````iframe:250
<script>
seajs.use(['tree'], function(Tree) {
  new Tree({
    url: './tree-children.json',
    model: {
      title: 'title',
      children: 'group',
      height: 200
    }
  }).render();
});
</script>
````

## 不显示根节点

````iframe:250
<script>
seajs.use(['tree'], function(Tree) {
  new Tree({
    url: './tree.json',
    model: {
      title: 'title',
      showRoot: false,
      height: 200
    }
  }).render();
});
</script>
````
