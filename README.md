# XML GUID Jumper

这是一个方便 XML 开发的跳转工具。

## 功能说明

支持在以下属性的值上使用 **Ctrl + 鼠标左键** (macOS 为 Cmd + Click) 进行跳转：

* `GuidDef`
* `SrcGuid`
* `DestGuid`

### 示例

当光标放在下面这些属性值上时：

```xml
GuidDef="a25d8c006-58fb-4625-a6b9-de2a68694d10a"
SrcGuid="a25d8c006-58fb-4625-a6b9-de2a68694d10a"
DestGuid="a25d8c006-58fb-4625-a6b9-de2a68694d10a"
```
按下 Ctrl+Click，插件会自动找到对应的定义:
Guid="a25d8c006-58fb-4625-a6b9-de2a68694d10a"
