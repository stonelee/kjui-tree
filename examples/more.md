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
