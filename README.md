# tree

---

提供了树型展示功能，并提供TreeGrid效果

---


## 配置

### title `String`

树标题，默认为空，表示不显示标题栏

### url `String`

ajax请求数据的路径

### data `Array`

直接加载静态数据

### fields `Array`

TreeGrid使用。用于进行列配置，包括

* `header` 列名
* `name` data中该列对应的key，对于树列不能配置该项
* `width` `Number` 该列宽度
* `align` 对齐方式,取值为`left`,`center`,`right`
* `render` 自定义渲染函数，参数为该单元格的值

```js
//加粗，并加后缀
render: function(value) {
  return '<b>' + value + '吨</b>';
}
```

### needCheckbox `Boolean`

TODO: 默认为false，如果设为true则出现多选框列

### width `Number`

整个tree的宽度，默认扩展到父元素宽度

### height `Number`

树内容高度，如果设置height，而显示内容过多，会自动出现下拉滚动条

## 属性

### data `Array`

返回从url或者data中得到的数据

### selected `$tr|Array`

返回当前选中的行，类型为jquery对象，可以使用 `$tr.data('data')` 得到该行对应的数据

默认为单选，返回的是jquery对象。
如果设置needCheckbox则为多选，返回的是数组

## 方法

### refresh ` `

TODO:刷新数据

## 事件

### click `target, data`

在树中点击触发

* `target` 被点击的元素，被包装成了jquery对象
* `data` 该行对应的数据

### rendered `tree`

组件渲染完毕后触发，用来对默认样式进行动态更改

* `tree` 组件实例
