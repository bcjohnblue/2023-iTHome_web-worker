# 將 Web worker 內嵌於 HTML 中 - Embedded worker

### 在 HTML 檔案中使用 Javascript

我們知道在 HTML 使用 Javascript 大致上有兩種方式

1. 從額外的檔案來源引入 js (external script)

在 HTML 的 \<head> 或 \<body> 中，可以插入帶有 src 的 \<script> 標籤，表示從額外的檔案來源引入 js

```html
<script src="javascript.js"></script>
```

2. 直接寫在行內的 script (inline script)

第 2 個方式是直接在 \<script> 標籤裡面撰寫 js，這樣在載入 HTML 時 js 會直接執行

```html
<script>
  alert("Hello World!");
</script>
```

### 在 Javascript 檔案中使用 Web worker

而在之前使用 web worker 的範例裡，都是在一個獨立的 js 檔案中，呼叫 new Worker() 的方式創建一個 worker 線程

```markup
// HTML
<script src="javascript.js"></script>
```

```javascript
// javascript.js
const worker = new Worker('worker.js');
```

那麽在使用 Web worker 的時候，是否有一個方式可以像以上第二種使用 inline script 的方式，直接將 Web worker 要使用的程式碼寫在 HTML 檔案裡呢？

這種方式就是今天要介紹的 Embedded worker



### 在 HTML 檔案中使用 Embedded worker

通常在 HTML 檔案中使用 Embedded worker 的方式，會在 \<script> 標籤中塞入一個無效的 [MIME 類型](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics\_of\_HTTP/MIME\_types/Common\_types)，例如：text/js-worker，因為是無效的 MIME 所以瀏覽器並不會把之中的程式解析變成 js 執行

```markup
<script type="text/js-worker">
  onmessage = (event) => {
    const { data } = event;
    console.log('worker 接收到的訊息：', event.data);
    postMessage('這是 worker 傳出去的訊息');
  };
</script>
```

接著將以上 \<script> 標籤裡的 worker 程式碼轉換成為 [blob 格式](https://zh.javascript.info/blob)，blob 之後可以轉為 url 並載入到 worker 裡

```html
// 另一個可以正常執行 js 的 script
<script>
  const blob = new Blob(
    Array.from(
      document.querySelectorAll("script[type='text\/js-worker']"),
      (script) => script.textContent,
    ),
    { type: "text/javascript" },
  );
</script>
```

然後可以使用 [window.URL.createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL\_static) 將 blob 轉為 url，並把 url 當作 worker 程式碼的來源丟入到 new Worker() 裡創建 worker 線程

```javascript
const worker = new Worker(window.URL.createObjectURL(blob));
```

最後就一樣可以使用 postMessage 的方式與 worker 溝通

```javascript
worker.postMessage('傳給 worker 的訊息')
```



### Embedded worker 使用場景

通常當 worker 中的程式碼不多時才會考慮使用 Embedded worker，因為當有很多複雜的邏輯時，就會傾向把不同的邏輯分拆到各個檔案裡執行，或甚至使用 [module worker](https://web.dev/module-workers/#enter-module-workers) 的模組方式，方便管理檔案

對我來說我剛好在寫 [第六天的文章 - postMessage 速度測試](https://ithelp.ithome.com.tw/articles/10323691) 的 [範例](https://codepen.io/bcjohnblue/pen/jOXBbWJ) 時遇到一些問題，當時原本是想將當天的範例用 [codesanbox](https://codesandbox.io/) 撰寫(因為他們可以分成很多的 .js, .html 檔案，比較方便管理)，但寫到一半似乎遇到了 codesanbox 的 bug，寫完後網站竟然跑不起來，情急之下趕快找了其他的線上編輯器網頁，後來打算改用 [codepen](https://codepen.io/)，來寫，但問題是 codepen 是設計來寫一些簡單的 demo 呈現，所以只能寫出單一的 .html, .css, .js 檔案，而沒有分資料夾檔案管理的功能，這時剛好 Embedder worker 就派上用場了，可以在 codepen 單一的 html 檔案裡撰寫 work 程式碼，並使用 Embedder worker 將 worker 線程創建出來執行



### **總結**

為求方便，demo 性質的程式碼可以使用 Embedded worker 的方式在同一個 HTML 檔案裡撰寫 js 程式，直接創建 worker 線程來使用



### Reference

[Embedded workers](https://developer.mozilla.org/en-US/docs/Web/API/Web\_Workers\_API/Using\_web\_workers#embedded\_workers)
