# 基本用法

- order: 1

---


## 树形组件

````iframe:250

<script>
seajs.use(['tree'], function(Tree) {
  new Tree({
    url: './tree.json',
    model: {
      title: 'title',
      height: 200
    },
    onSelect: function(target, data) {
      console.log(target, data);
    }
  }).render();
});
</script>
````

## 树形表格组件

````iframe:300
<script>
seajs.use(['tree'], function(Tree) {

  var fields = [{
    width: 200
  },{
    header: '编号',
    name: 'id',
    width: 150,
    align: 'center'
  }, {
    header: '名称',
    name: 'name',
    render: function(value) {
      return '<b>' + value + '</b>';
    }
  }];
  new Tree({
    url: './tree.json',
    model: {
      fields: fields,
      title: 'title',
      height: 190
    },
  }).render();
});
</script>
````
