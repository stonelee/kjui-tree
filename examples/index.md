# 基本用法

- order: 1

---


## 树形组件

````iframe:250
<div id="demo1"></div>

<script>
seajs.use(['tree'], function(Tree) {
  new Tree({
    element: '#demo1',
    title: 'title',
    url: './tree.json',
    height: 200,
    onSelect: function(target, data) {
      console.log(target, data);
    }
  }).render();
});
</script>
````

## 树形表格组件

````iframe:300
<div id="demo1"></div>

<script>
seajs.use(['tree'], function(Tree) {

  var fields = [{
    width: 200
  },{
    header: '编号',
    align: 'center',
    width: 150,
    name: 'id'
  }, {
    header: '名称',
    name: 'name',
    render: function(value) {
      return '<b>' + value + '</b>';
    }
  }];
  new Tree({
    element: '#demo1',
    title: 'title',
    url: './tree.json',
    fields: fields,
    height: 200
  }).render();
});
</script>
````
