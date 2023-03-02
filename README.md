# Bob的有道词典插件
这个版本是在[akl7777777](https://github.com/akl7777777/bob-plugin-akl-youdao-free-translate)的版本上进行更改的，维护一个自用的版本，根据自己的需要新增和删减了一些代码，同时可以选择单词数量进行翻译。

这个版本目前用的是逆向的Web API，以后会增加有道官方的API，两者会同时存在。



## API选择

可以选择对应的API翻译，目前只有一种WEB API，以后会加上有道官方的API。



## 根据单词数进行翻译

如果选中文本超过选定的单词书，插件不会翻译。比如选择的是`1`，选中`Message Queue `，因为有2个单词，插件不会请求API，直接返回不翻译的结果。

![](https://user-images.githubusercontent.com/3600657/222195336-9f12a375-4287-4677-9cd9-2cac50a2c684.png)