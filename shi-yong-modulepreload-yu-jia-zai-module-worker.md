# 使用 modulepreload 預加載 module worker

在優化 web worker 時，有一個小技巧是[利用 modulepreload 使得 worker 的載入速度變快](https://web.dev/module-workers/#preload-workers-with-modulepreload)，使用方法其實跟用 [preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload) 一樣&#x20;

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Dedicated worker</title>
    <meta charset="UTF-8" />
    
    <!-- 預先加載重要的 worker.mjs 檔案 -->
    <link rel="modulepreload" href="worker.mjs" />
    <script src="./src/index.mjs" type="module"></script>
  </head>

  <body>
    <div id="app"></div>
  </body>
</html>
```

要怎麼確認 modulepreload 的功能有作用呢？可以打開 devtool 的 network 選項，查看 `worker.mjs`是否會在 `index.mjs`前被載入，這裡有個 [demo](https://codesandbox.io/s/module-preload-jycg7q) 大家可以看到兩種不同寫法，在 network 中瀏覽器載入檔案的順序會不同，加了 `<link rel="modulepreload" href="worker.mjs" />`這一行後，可以在 network 中看到 `worker.mjs` 會提早在 `src/index.mjs`之前載入。

#### 自動加載所有依賴項

在 [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/modulepreload) 中還提到了這一點

> A browser _may_ additionally also choose to automatically fetch any dependencies of the module resource.

瀏覽器可以額外選擇自動的加載模塊中用到的所有依賴模塊。

關於這一點這個 [demo](https://codesandbox.io/s/module-preload-jycg7q?file=/public/add.mjs) 也有測試一下，可以看到 `add.mjs`被 `worker.js`依賴，但沒有寫在 modulepreload 裡，如果瀏覽器會自動加載所有依賴模塊的話，`add.mjs`應該也會提前加載，但我實測發現在目前 Chrome 116 的瀏覽器，`add.mjs`會在最後才被加載，代表目前瀏覽器應該沒有實作此功能。

#### modulepreload 不僅預加載，而且也解析、編譯了 Javascript 模塊

> Links with `rel="modulepreload"` are similar to those with [`rel="preload"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload). The main difference is that `preload` just downloads the file and stores it in the cache, while `modulepreload` gets the module, parses and compiles it, and puts the results into the module map so that it is ready to execute.

基本上 modulepreload 跟 preload 是很相似的，但有一個主要的不同點在於，preload 只預先下載檔案並把它快取在瀏覽器中，然而 modulepreload 做到的更多，它更進一步的 解析 (parse) 而且 編譯 (compile) Javascript 模塊。

一開始看到這段想說 preload 跟 modulepreload 其實沒什麼差別，不過就是多進行了 parse 跟 compile 而已，但深入瞭解後發現 parse 跟 compile 其實是一段很複雜的過程，這一段會放在後面的**小知識 2. Javascript 的解析(parse) 與編譯(compile)** 進行補充。

### 補充小知識

1. preload 是什麼？

preload 指令用來明確的告知瀏覽器，這份資源檔案很重要，請優先加載這份資料！通常會用到這個指令的場景是希望優先加載一些被寫在很深層的內嵌 css 或字型檔等，像以下的狀況，`important-font.woff2` 這個字型檔可能被嵌套在很深的 css 中

```
index.html
main.js
styles/
    main.css
        ...
            ...
            font.css
            important-font.woff2
        
```

#### index.html

```
<head>
  <meta charset="utf-8">
  <title>Preload example</title>

  <!-- 明確告知瀏覽器，優先加載某個很深路徑的字型檔 -->
  <link
    rel="preload"
    href="styles/very/deep/path/important-font.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  </link>
  
  <link href="styles/main.css" rel="stylesheet" />
</head>

<body>
  <h1>App</h1>
</body>
```

在不加 preload 的一般狀況下，瀏覽器會優先讀取到 styles/main.css，然後再往下讀取這份 .css 中用到了哪些其他的 css 或是字型檔，等到瀏覽器解析到 important-font.woff2 這份檔案時，已經過去一段時間了，而這時瀏覽器才會開始去抓這份重要的字型檔，為了避免這個狀況才出現了 preload 這種可以明確聲明告知瀏覽器的方式，這個頁面接下來會用到這份重要的資料，所以請幫我優先下載他。

有興趣了解更多的請參考以下文章：

[\[教學\] Preload, Prefetch 和 Preconnect 的差異](https://www.shubo.io/preload-prefetch-preconnect/)

[HTTP/2 服务器推送（Server Push）教程](https://www.ruanyifeng.com/blog/2018/03/http2\_server\_push.html)



2. Javascript 的解析(parse) 與編譯(compile)

前端工程師整天跟瀏覽器打交道，我個人最常用的就是 Chrome，相信大家一定都有聽過 Chrome 用來處理 Javascript 的就是 V8 引擎，那什麼是 V8 引擎呢？它實際上就包含了對於 Javascript 進行 parse 與 compile 的處理

<figure><img src=".gitbook/assets/javascript engine.jpeg" alt=""><figcaption><p>圖片來源：<a href="https://dev.to/edisonpappi/how-javascript-engines-chrome-v8-works-50if">https://dev.to/edisonpappi/how-javascript-engines-chrome-v8-works-50if</a></p></figcaption></figure>

我們工程師寫的這些 JS 檔案 (source code)，雖然人類看得懂但對於電腦來說就像是天書一樣，所以 JS 檔案需要轉換為機器看得懂的機器碼，而這個轉換的過程就是中間這一塊 Javasciprt 引擎處理的範疇，而這塊大致上來說可以分成三個步驟： **解析(parse) 原始碼結構 => 轉換為 AST => 交由 解釋器(Interpreter) 及 編譯器(Compiler)**，最終變為可執行的機器碼。而中間這塊的每個步驟其實都牽涉到蠻複雜的知識，我找到一些不錯的網站希望分享給大家，讓大家快速理解：

[深入研究 JavaScript 引擎 - (Chrome V8)](https://dev.to/edisonpappi/how-javascript-engines-chrome-v8-works-50if) - 概略說明各個步驟的作用，初步暸解 V8 引擎

[How JavaScript works: Optimizing for parsing efficiency](https://blog.logrocket.com/how-javascript-works-optimizing-for-parsing-efficiency/) - 解釋 parse => AST 這段的過程

[淺談 AST 及 ESlint Rule：AST 是殺毀？（上）](https://chihyang41.github.io/2021/06/28/AST-and-ESLint-Introduction-part-1/)- 用簡單易懂的方式講解什麼是 AST

[JavaScript 编译 - JIT (just-in-time) compiler 是怎么工作的](https://zhuanlan.zhihu.com/p/99395691) - 清楚易懂的實例，講解 Interpreter 到 Compiler 這段過程的原理

