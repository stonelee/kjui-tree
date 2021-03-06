# tree

---

基于Grid，提供了树型展示功能，可以自定义级联选择

---


## 配置

### url `String`

ajax请求数据的路径

### data `Array`

直接加载静态数据

## model

### title `String`

树标题，默认为空，表示不显示标题栏

### fields `Array`

TreeGrid使用。用于进行列配置，包括

* `header` 列名
* `name` data中该列对应的key，对于树列不能配置该项
* `width` `Number` 该列宽度,如果不设则平均分配
* `align` 对齐方式,取值为`left`,`center`,`right`
* `render` 自定义渲染函数，参数为该单元格的值

```js
//加粗，并加后缀
render: function(value) {
  return '<b>' + value + '吨</b>';
}
```

### showRoot `Boolean`

默认为true，如果设为false则不显示根节点，多用于accordion

### children `String`

包含子节点的数组对应的key，默认为children

### multiSelect `Boolean`

默认为false，如果设为true则出现多选框，这时可以进行多选

### cascade `Boolean`

默认为false，如果设为true可以级联选择

选中（取消）父节点，子节点自动选中（取消）；选中（取消）子节点，父节点不变

### width `Number`

整个tree的宽度，默认扩展到父元素宽度

### height `Number`

树内容高度，如果显示内容过多，会自动出现下拉滚动条

## 属性

### data `Array`

返回从url或者data中得到的数据

### selected `$tr|Array`

返回当前选中的行，类型为jquery对象，可以使用 `$tr.data('data')` 得到该行对应的数据

默认为单选，返回的是jquery对象。
如果设置multiSelect则为多选，返回的是数组

## 方法

### select `$row`

将$row选中，只能在单选树中使用

### expand `$row`

将$row展开

### shrink `$row`

将$row收缩

### check `$row`

多选树中使用，使得该行被选中

### unCheck `$row`

多选树中使用，使得该行被取消选中

### refresh ` `

刷新数据，会导致选中效果失效

## 事件

### click `target, data`

在树中点击或者使用select方法触发，收缩展开操作以及选中checkbox不会触发

* `target` 被点击的元素，被包装成了jquery对象
* `data` 该行对应的数据

### loaded `  `

数据加载完毕后触发，可以自由更改默认样式

* `tree` 组件实例

## $row.data

### data `  `

该行对应的data

### parent ` `

该行的父节点

### children ` `

该行所有层级的子节点组成的数组

### siblings ` `

该行相同层级的其他节点组成的数组

## 节点属性

### data-id `tr`

该行对应的id

### data-status `tr`

非叶子节点是否已展开，如果已展开为`expanded`

### data-role `tr|input`

* 非叶子节点 `expander`
* 叶子节点 `leaf`
* 多选框 `check`
* 点击文字 `text`
