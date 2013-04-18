# 更多

- order: 2

---

## 多选

````iframe:300
<div id="demo1"></div>

<script>
seajs.use(['tree'], function(Tree) {
  window.tree = new Tree({
    element: '#demo1',
    title: 'tree',
    url: './tree.json',
    multiSelect: true,
    height: 200,
    onSelect: function(target, data) {
      console.log(target, data);
    }
  }).render();
});
</script>
````

## 选中某一行

````iframe:300
<div id="demo1"></div>
<button id="select521">select 521</button>

<script>
seajs.use(['$','tree'], function($,Tree) {
  var tree = window.tree = new Tree({
    element: '#demo1',
    title: 'tree',
    url: './tree.json',
    height: 200,
    onSelect: function(target, data) {
      console.log(target, data);
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

````iframe:300
<div id="demo1"></div>

<script>
seajs.use(['tree'], function(Tree) {
  window.tree = new Tree({
    element: '#demo1',
    title: 'tree',
    url: './tree.json',
    multiSelect: true,
    cascade: true,
    height: 200,
    onSelect: function(target, data) {
      console.log(target, data);
    }
  }).render();
});
</script>
````

## 自定义关联选择（用于菜单管理）

````iframe:300
<div id="demo1"></div>

<script>
seajs.use(['$', 'tree'], function($, Tree) {
  window.tree = new Tree({
    element: '#demo1',
    title: 'tree',
    url: './tree.json',
    multiSelect: true,
    cascade: true,
    height: 200,
    onSelect: function(target, data) {
      console.log(target, data);
    },
    onRendered: function(tree){
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

      tree.delegateEvents('click [data-role=check]', function(e){
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

````iframe:300
<div id="demo1"></div>

<script>
seajs.use(['tree'], function(Tree) {
  window.tree = new Tree({
    element: '#demo1',
    title: 'tree',
    url: './tree-children.json',
    children: 'group',
    height: 200,
    onSelect: function(target, data) {
      console.log(target, data);
    }
  }).render();
});
</script>
````
