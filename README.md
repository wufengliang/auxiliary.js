### Auxiliary.js

> `基于界面辅助布局使用`

#### `IOptions`
| 字段       | 类型     | 是否可选 | 说明                    | 默认值 |
| ---------- | -------- | -------- | ----------------------- | ------ |
| width | `Number` | `否` | `容器宽度` | - |
| height | `Number` | `否` | `容器高度` | - |
| container | `HTMLElement` | `否` | `挂载容器` | - |
| list | `INormalItem[]` | `是` | `-` | - |


#### `INormalItem`
| 字段       | 类型     | 是否可选 | 说明                    | 默认值 |
| ---------- | -------- | -------- | ----------------------- | ------ |
| url | `String` | `否` | `图片url或base64` | - | 
| width | `Number` | `是` | `图片宽度;不传默认取图片真实宽度` | - |
| height | `Number` | `是` | `图片高度;不传默认取图片真实高度` | - |
| top | `Number` | `否` | `距离对应面板顶部距离` | `0` | -
| left | `Number` | `否` | `距离对应面板左侧距离` | `0` | -

#### `ISingleItem`继承自`INormalItem`
| 字段       | 类型     | 是否可选 | 说明                    | 默认值 |
| ---------- | -------- | -------- | ----------------------- | ------ |
| rowPoints | `[Number,Number,Number]` | `是` | 图片横向节点 | - |
| columnPoints | `[Number,Number,Number]` | `是` | 图片纵向节点 | - |


#### 使用案例

##### `iife模式`
```javascript
const list = [
    {
        url:'https://imagekit.io/blog/content/images/2020/06/LinkedIn-1200_628.png', 
        width:300,
        height:200,
        top:100,
        left:50,
    },
    {
        url:'https://mc.qcloudimg.com/static/img/1bead74703061b71eeaf6bf4db27fcdb/image.png',
        left:300,
        width:150,
        height:250,
    },
    {
        url:'https://tse2-mm.cn.bing.net/th/id/OIP-C.k8OHBQMqN5I55R9PlM8bGAHaFT?rs=1&pid=ImgDetMain',
        left:100,
        width:100,
        height:200,
    }
]
const instance = new auxiliary.AuxiliaryCore({
    width:1900,
    height:1600,
    list,
    container:document.querySelector('#app')
})

```