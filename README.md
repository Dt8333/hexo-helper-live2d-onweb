# hexo-helper-live2d-onweb

将[hexo-helper-live2d](https://github.com/EYHN/hexo-helper-live2d)移植到[Live2dOnWeb](https://github.com/Konata09/Live2dOnWeb)上

<br>

向你的Hexo里放上一只萌萌哒二次元看板娘!

## 配置

请向Hexo的 `_config.yml` 文件或主题的 `_config.yml` 文件中添加配置.

示例:

```yml
# hexo-helper-live2d-onweb
live2d:
  enable: true
  pluginRootPath: live2dw/ # Root path of plugin to be on the site (Relative)
  pluginJsPath: lib/ # JavaScript path related to plugin's root (Relative)
  pluginModelPath: assets/ # Relative model path related to plugin's root (Relative)
  scriptFrom: local # Default
  # scriptFrom: jsdelivr # jsdelivr CDN(暂未上传)
  # scriptFrom: unpkg # unpkg CDN(暂未上传)
  # scriptFrom: https://cdn.jsdelivr.net/gh/dt8333/Live2dOnWeb@master/dist/live2d_bundle.js # Your custom url
  tagMode: false # Whether only to replace live2d tag instead of inject to all pages
  model:
    use: live2d-widget-model-wanko
  live2d_settings:
    tipsMessage: '' #waifu-tips.json                                   #看板娘提示消息文件的路径，可以留空不加载
    #模型设置
    modelStorage: true                                                 #记忆模型，下次打开页面会加载上次选择的模型
    modelRandMode: false                                               #随机切换模型
    preLoadMotion: true                                                #是否预载动作数据，只对 model3 模型有效，不预载可以提高 model3 模型的加载速度，但可能导致首次触发动作时卡顿
    tryWebp: true                                                      #如果浏览器支持 WebP 格式，将优先加载 WebP 格式的贴图，例如默认贴图文件为 klee.8192/texture_00.png，
                                                                       #启用后将优先加载 klee.8192/texture_00.png.webp，文件不存在会自动 fallback
    #工具栏设置
    showToolMenu: true                                                 #显示 工具栏
    canCloseLive2d: true                                               #显示 关闭看板娘 按钮
    canSwitchModel: true                                               #显示 模型切换 按钮
    canSwitchHitokoto: true                                            #显示 一言切换 按钮
    canTakeScreenshot: true                                            #显示 看板娘截图 按钮
    canTurnToHomePage: true                                            #显示 返回首页 按钮
    canTurnToAboutPage: true                                           #显示 跳转关于页 按钮
    showVolumeBtn: false                                               #显示 音量控制 按钮，仅作显示，相关逻辑需自己实现
    #提示消息设置
    showHitokoto: true                                                 #空闲时显示一言
    hitokotoAPI:                                                       #一言 API，可选 'hitokoto.cn'(默认), 'lwl12.com', 'jinrishici.com'(古诗词), 'fghrsh.net'
    showWelcomeMessage: true                                           #显示进入页面欢迎词
    showCopyMessage: true                                              #显示复制内容提示，默认只对 '#articleContent' 元素内的复制进行监视
    showF12OpenMsg: true                                               #显示控制台打开提示
    #看板娘样式设置
    live2dHeight: 300                                                  #看板娘高度，不需要单位
    live2dWidth: 220                                                   #看板娘宽度，不需要单位
    waifuMinWidth: disable                                             #页面小于宽度小于指定数值时隐藏看板娘，例如 'disable'(禁用)，推荐 '1040px'
    waifuEdgeSide: right:0                                             #看板娘贴边方向，例如 'left:0'(靠左 0px)，'right:30'(靠右 30px)，可以被下面的模型设置覆盖
    #其他杂项设置
    debug: true                                                        #全局 DEBUG 设置
    debugMousemove: false                                              #在控制台打印指针移动坐标，仅在 debug 为 true 时可用
    logMessageToConsole: true                                          #在控制台打印看板娘提示消息
    l2dVersion: 2.0.0,                                                 #当前版本
    homePageUrl: https://rivens.bronya.moe/                            #主页地址，可选 'auto'(自动), '{URL 网址}'
    aboutPageUrl: https://github.com/Dt8333/hexo-helper-live2d-onweb/  #关于页地址, '{URL 网址}'
    screenshotCaptureName: bronyaMoe.png                               #看板娘截图文件名，例如 'live2d.png'
```
