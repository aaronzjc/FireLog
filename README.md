## FireLog

类似于FireBug的FirePHP插件，方便开发者调试PHP应用。

FirePHP的原理是，在响应头中加入需要打印的LOG信息，然后在FirePHP中，进行解析即可。FirePHP因为一些原因，使用不了了，这里写了一个Chrome的插件。

## 截图

![intro](./demo/intro.png)
![detail](./demo/detail.png)

## 已知问题

1. 点击Object查看详情时，无法进行折叠。
2. Tab更新事件和requestFinish事件的顺序为题会导致有时候展示为空。

## Licence

MIT.
