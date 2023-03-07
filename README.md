# Bob的有道词典插件
这个版本是在[akl7777777](https://github.com/akl7777777/bob-plugin-akl-youdao-free-translate)的版本上进行更改的，维护一个自用的版本，根据自己的需要新增和删减了一些代码，同时可以选择单词数量进行翻译。

因为有道本身的词库非常丰富，所以这个插件注重的是**词典**功能。多文本翻译也能用，不过更推荐使用如DeepL、Google或者是国内的腾讯翻译君等翻译质量更好的API。


## API选择

可以选择对应的API翻译，目前有2种API，分别为网页API和官方API

* 网页API   
  这是从官方逆向得到的API，所以不需要填写自己的APPID和Secret。这个API的功能比较全，翻译的结果会比较多，但不绝对稳定，一旦官方的API有变动，需要等待更新才能使用

* 官方API   
  这是有道官方提供的翻译API，需要自己填写APPID和Secret

两种方式各有好坏，可以根据自己的实际情况使用。

![](https://user-images.githubusercontent.com/3600657/222902074-c70d7905-7d26-4964-a6d2-8bf90bcd55d3.png)



## 根据单词数进行翻译

如果选中文本超过选定的单词数量，插件不会翻译。比如选择的是`1`，选中`Message Queue `，因为有2个单词，插件不会请求API，直接返回不翻译的结果。

![](https://user-images.githubusercontent.com/3600657/223156638-8a72cdfd-896e-4a29-87b7-4df4a3115ce3.png)



<img src="https://user-images.githubusercontent.com/3600657/223155637-ed90fb1f-a37f-469b-8659-7658ddcca19e.png" >

## License
MIT