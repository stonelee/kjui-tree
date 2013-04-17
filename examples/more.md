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
