# 更多

- order: 2

---

## 多选

````iframe:300
<div id="demo1"></div>

<script>
seajs.use(['tree'], function(Tree) {
  new Tree({
    element: '#demo1',
    title: 'tree',
    url: './tree.json',
    height: 200,
    onClick: function(){
      console.log('d');
    }
  }).render();
});
</script>
````
