# fs-localstorage

fs-localstorage是一个基于fs文件存储的、提供localstorage api风格的存储库

##  使用方式

1.创建实例，第一个参数是存储路径，第二个参数设置仓库容量大小（bytes）默认为5MB

```js
const Localstorage = require('fs-localstorage');

const localstorage = new Localstorage('./store', 50000);
```

2.可以使用如下localstorage的api

- length
- setItem(key, value)
- getItem(key)
- removeItem(key)
- key(n)
- clear()

在存取时，用`JSON.stringify`和`JSON.parse`对数据进行处理

3.利用proxy对localstorage的get、set操作转发到`getItem`和`setItem`

