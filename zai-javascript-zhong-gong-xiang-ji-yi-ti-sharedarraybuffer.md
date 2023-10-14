# 在 Javascript 中共享記憶體 - SharedArrayBuffer

在這 Web worker 的系列文一開始提到 worker 線程之間的資料傳遞使用 postMessage

```javascript
const worker = new Worker('worker.js);
worker.postMessage('data');
```

而在 postMessage 背後執行的是 structuredClone 算法，需要複製再將資料傳遞，所以會非常慢。

接著介紹了 **transfer** 參數，只要是 Transferable objects 型態的資料都可以將資料的擁有權轉移到另一個線程中

```javascript
const uInt8Array = new Uint8Array(1024 * 1).map((v, i) => i);
console.log(uInt8Array.byteLength); // 1024

// 將資料轉移到 worker 線程
worker.postMessage(uInt8Array, [uInt8Array.buffer]);
// 轉移過後資料就不在原本的線程了，所以 byteLength === 0
console.log(uInt8Array.byteLength); // 0
```

這種方式不會整個複製資料，而是將 [原本資料在記憶體緩衝區(buffer) 裡的所有權移轉到 worker 線程](https://developer.mozilla.org/en-US/docs/Web/API/Web\_Workers\_API/Transferable\_objects)中，所以轉移後原線程就無法取得資料了，由第 x 天的速度測試來看，使用 transfer 時因為略過了複製資料，資料傳遞會更加快速。但 transfer 的方式只是將記憶體中的 buffer 從原本的線程轉移到另一個線程，實際上同時間只能有一個線程處理這筆資料，所以 **`SharedArrayBuffer`** 出現了。

**`SharedArrayBuffer`**做到的是真正的共享記憶體，當 **`SharedArrayBuffer`** 在不同線程中傳遞時，實際上傳遞就是記憶體位址。

以下讓我們先介紹下 **`SharedArrayBuffer`** 的用法後再來說明**`SharedArrayBuffer`** 使用的時機及使用時需注意的安全性問題。

**創建 SharedArrayBuffer**

建立的方式跟 ArrayBuffer 一樣，傳入的參數都是指分配多少 bytes 的記憶體空間，創建後直接使用 postMessage 就可以將整個記憶體傳到另一個線程

```javascript
const sab = new SharedArrayBuffer(1024); // 1024 bytes
worker.postMessage(sab);
```

**增加 SharedArrayBuffer 的記憶體空間**

在創建 **SharedArrayBuffer** 的時候，可以在第二個參數傳入 `maxByteLength` 設定記憶體空間的上限，並且之後可以用 [growable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/SharedArrayBuffer/growable) 及 [grow](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/SharedArrayBuffer/grow) 手動增加控制記憶體空間

但基於安全性的考量，**SharedArrayBuffer** 只能增加記憶體空間不能減少

```javascript
// 初始 8 bytes，上限 16 bytes
const buffer = new SharedArrayBuffer(8, { maxByteLength: 16 });

if (buffer.growable) {
  console.log("SAB is growable!");
  // 記憶體空間增長到 12 bytes
  buffer.grow(12);
}
```

**使用 SharedArrayBuffer**

由於使用 **SharedArrayBuffer** 創建出來的是共享記憶體，代表不同線程都有可能同時操作到記憶體本身，而造成一些意想不到的問題出現 (ex. [race condition](https://zh.wikipedia.org/zh-tw/%E7%AB%B6%E7%88%AD%E5%8D%B1%E5%AE%B3))，所以實際上 **SharedArrayBuffer** 是不能直接使用的，需要搭配 [Atomic](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/Atomics) (明天會再介紹)，或甚至是使用專業的套件庫，才不會出現問題

**使用 SharedArrayBuffer 的安全性問題**

[MDN 官方文件](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/SharedArrayBuffer#security\_requirements) 有提到大約 2018 年左右因為 [spectre](https://en.wikipedia.org/wiki/Spectre\_\(security\_vulnerability\)) 的攻擊，導致不同線程間共用記憶體這件事是有資安漏洞的，因此瀏覽器也停用了 **SharedArrayBuffer** 的使用，直到 2020 年時，因為提出了新的安全性預防方法，才讓 **SharedArrayBuffer** 的功能可以再次啟用。所以目前使用 **SharedArrayBuffer** 時都必須在回傳的 html 檔案標頭 (response header) 有設定以下兩項才有作用：

```html
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

如果沒有設定這兩項的話，**SharedArrayBuffer** 會直接顯示沒有定義的錯誤：`Uncaught ReferenceError: SharedArrayBuffer is not defined`

<figure><img src=".gitbook/assets/截圖 2023-09-26 下午8.02.14.png" alt=""><figcaption></figcaption></figure>

[**crossOriginIsolated**](https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated)

而在瀏覽器中提供了一個方便的屬性 [**crossOriginIsolated**](https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated)，去判斷以上兩條 `Cross-Origin-Opener-Policy、`Cross-Origin-Embedder-Policy 設定的值是不是安全性都夠高，讓 **SharedArrayBuffer** 可以使用

```javascript
const myWorker = new Worker("worker.js");

if (crossOriginIsolated) {
  const buffer = new SharedArrayBuffer(16);
  myWorker.postMessage(buffer);
} else {
  const buffer = new ArrayBuffer(16);
  myWorker.postMessage(buffer);
}
```

[**Cross-Origin-Opener-Policy (COOP)**](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy)

這個屬性控制了不同 `window` 視窗間是否可以取得另一個 `window` 的瀏覽器上下文環境(browsing context)

如果 window A 開啟了 window B，則使用 B.opener 會回傳 A

```javascript
// window A (https://windowA.com)
window.open('https://windowB.com');
```

```javascript
// window B (https://windowB.com)
console.log(window.opener) // 取得 window A 的 browsing context
```

而在跨域的狀況下 (也就是以上的 `https://windowA.com` 跟 `https://windowB.com`)，window B 無法透過 [`window.opener`](https://developer.mozilla.org/en-US/docs/Web/API/Window/opener)取得 windowA 的變數、函數等等資料。但即使在跨域的狀況下 window B  依舊可以取得原網站 window A 的網址(windowA.location)。而這樣 window B 就可以在自己的網站中，額外開啟 window A 中其他頁面，並把原本正確的內容替換掉，達到網路釣魚的攻擊。

而當設定了 **Cross-Origin-Opener-Policy (COOP)** 為 same-origin 後，跨域網站的 window B 就再也拿不到 window.opener 的相關資訊了

```javascript
// window B (https://windowB.com)
console.log(window.opener) // null
```

所以設定了 `Cross-Origin-Opener-Policy: same-origin` 保證了 **SharedArrayBuffer** 不會被額外開啟的跨域網站拿到原本網站的資訊，導致進一步的惡意攻擊。

[**Cross-Origin-Embedder-Policy (COEP)**](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy)

Embedder-Policy 代表著網頁內嵌資源的政策，將這個屬性設為 `require-corp` 的時候，意味著 html 文檔以下載入的所有資源，都必須是 **同源** 或是 **明確標記為可從另一個來源載入的資源。**

```javascript
Cross-Origin-Embedder-Policy: require-corp
```

**什麼是明確標記為可從另一個來源載入的資源呢？**

原本在 HTML 中引入圖片只需要給予 src 指向的 url 即可

```html
<img src="https://thirdparty.com/img.png" />
```

但當設置 COEP 為 `require-corp` 後，所有資源都必須明確標記是可以從另一個來源載入的，這裡的明確標記指的就是需要為 img 標籤增加 crossorigin，明確告知我就是要用 CORS 的方式拿取這個圖像資源

```html
<img src="https://thirdparty.com/img.png" crossorigin />
```

當使用 crossorigin 引用外部圖片的時候，也意味著圖片伺服器至少需要回傳允許跨域的回應標頭(response header)，例如：

```html
Access-Control-Allow-Origin: *
```

但我們無法控制引用的外部圖片伺服器是否都有這些 response header，當遇到這個狀況產生時，可以將 COEP 設置為 `credentialless`，代表在使用以上這種 `<img src="..." />`請求圖片的時候不會帶上任何憑證資訊(Cookie)，[但 credentialless 目前是實驗性屬性，Firefox 及 Safari 都尚未支援](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy#certain\_features\_depend\_on\_cross-origin\_isolation)

```markup
Cross-Origin-Embedder-Policy: credentialless
```

所以將 Cross-Origin-Embedder-Policy 設定為 require-corp 或是 `credentialless` 保證了 **SharedArrayBuffer** 不會跨域其他資源有機會進行一些的惡意攻擊(ex. 前面提到的 spectre)。

**額外補充**

這裡提到的相關安全性設定其實只有一小部分，推薦大家閱讀胡立大大專業的資安文章 [跨來源的安全性問題](https://ithelp.ithome.com.tw/articles/10324775)，其中也能夠幫助讀者快速理解什麼是 spectre 攻擊。

### 範例

提到這麼多東西我想大家還是會覺得蠻模糊的，以下就讓我們用範例來看看如何實際使用**SharedArrayBuffer**

[範例 Demo](https://codesandbox.io/p/sandbox/sharedarraybuffer-grx5gg)



**設置回傳標頭 (response header)**

首先因為使用 **SharedArrayBuffer** 需要讓網站達到足夠的安全性，我們先在 server 端設定了需要回傳的 header

```javascript
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  // 設定安全性問題需要回傳的兩項 header
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  
  res.sendFile(__dirname + "/index.html");
});
```

**index.html**

接著在 html 檔案中，想要顯示的是 crossOriginIsolated 的值，如果網站是可以正常使用 **SharedArrayBuffer** 的話，crossOriginIsolated 就會是 true，反之為 false

<pre class="language-html"><code class="lang-html">&#x3C;body>
  &#x3C;div id="app">
    &#x3C;h1>SharedArrayBuffer&#x3C;/h1>
    &#x3C;!-- 顯示 crossOriginIsolated 的值 -->
    &#x3C;h3 class="cross-origin-isolated">
      <a data-footnote-ref href="#user-content-fn-1">crossOriginIsolated</a>: 
    &#x3C;/h3>
  &#x3C;/div>

  &#x3C;script src="public/index.mjs" type="module">&#x3C;/script>
&#x3C;/body>
</code></pre>

**index.mjs**

接著在 javascript 中，獲取 crossOriginIsolated 的值，並顯示在畫面上

```javascript
document.querySelector('.cross-origin-isolated').textContent = 
`crossOriginIsolated: ${crossOriginIsolated}`;

// 如果 crossOriginIsolated 為 true，可以使用 SharedArrayBuffer
if (crossOriginIsolated) {
  const sab = new SharedArrayBuffer(1024);
  console.log('The value of SharedArrayBuffer', sab);
}
```



那麼我們來看看結果吧，令人意外的是 server 都設定正確的 response header 了，為什麼 crossOriginIsolated 還是 false 呢？

<figure><img src=".gitbook/assets/截圖 2023-09-28 下午12.06.21.png" alt=""><figcaption></figcaption></figure>

我找了一段時間才發現原因出在 codesanbox 的架構，我們編寫的 HTML 在預設的 codesanbox 網站裡是用 iframe 內嵌進去的

<figure><img src=".gitbook/assets/截圖 2023-09-28 下午1.48.53.png" alt=""><figcaption></figcaption></figure>

而前面所做的 response header 設定，影響到的是這個 iframe 載入的 HTML 文檔，回頭看到 MDN 寫的使用 **SharedArrayBuffer** 的安全性設定寫到：

> For top-level documents, two headers need to be set to cross-origin isolate your site:

關鍵就在這裡的 top-level documents 是之前被我忽略的，我們加的兩個 response header 在codesanbox 中是加到 iframe 所在的 HTML 文檔，而不是 top-level document，所以導致了 crossOriginIsolated 會是 false，這一點也可以從 Chrome devtool 裡看到

<figure><img src=".gitbook/assets/截圖 2023-09-28 下午1.58.35.png" alt=""><figcaption></figcaption></figure>

<figure><img src=".gitbook/assets/截圖 2023-09-28 下午1.58.42.png" alt=""><figcaption></figcaption></figure>

而解決方式很簡單就是按下右上角的另開分頁，把網站單獨開出來

<figure><img src=".gitbook/assets/截圖 2023-09-28 下午2.40.06.png" alt=""><figcaption></figcaption></figure>

接著再查看網站的安全性部分，就會發現 response header 是設定正確的網站了

<figure><img src=".gitbook/assets/截圖 2023-09-28 下午2.45.21 (1).png" alt=""><figcaption></figcaption></figure>

### 小結

SharedArrayBuffer 允許不同線程中可以操作同一塊記憶體，達到高效能的並行運算，但因為會有 spectre 等惡意攻擊的風險，所以對於網站的安全性要求也較高，需要在 HTML 回應的 response header 有相對應的設定才能使用 SharedArrayBuffer



**補充小知識**

1.  **Cross-Origin-Resource-Policy**

    當點開範例中的 network 選項時，會發現有一個檔案 \`[https://codesandbox.io/p/preview-protocol.js](https://codesandbox.io/p/preview-protocol.js)\` 被偷偷塞入在我們撰寫的 HTML 檔案中使用

<figure><img src=".gitbook/assets/截圖 2023-09-28 下午2.54.52.png" alt=""><figcaption></figcaption></figure>

而點開這個檔案時會發現它沒有辦法被載入進來，這時會跳出一個警告要設定正確的 Cross-Origin-Resource-Policy

<figure><img src=".gitbook/assets/截圖 2023-09-28 下午2.53.28.png" alt=""><figcaption></figcaption></figure>

會有這個警告的出現是因為我們設置了 Cross-Origin-Embedder-Policy: require-corp，這代表了網站內的所有資源都必須 **明確的標記為可從另一個來源載入的資源**，所以這裡的警告就提出需要將這個資源 response header 的 Cross-Origin-Resource-Policy 設為 same-site 或是 cross-origin 分別代表著這個資源是 **同站點的** 或是 **跨域的來源**，如此才能正確載入這個檔案。

但就像之前所說的，我們無法對於這個外來的資源 ([https://codesandbox.io/p/preview-protocol.js](https://codesandbox.io/p/preview-protocol.js)) 設定其 response header，所以如果真的要載入這個資源的話，可以考慮將 Cross-Origin-Embedder-Policy 設定成 credentialless，這樣就不會出現 Cross-Origin-Resource-Policy 的警告，並且可以正常加載資源了。



### Reference

[A cartoon intro to ArrayBuffers and SharedArrayBuffers](https://hacks.mozilla.org/2017/06/a-cartoon-intro-to-arraybuffers-and-sharedarraybuffers/)

推薦大家必看的文章，淺顯易懂的用漫畫說明什麼是記憶體，然後再講解到 **SharedArrayBuffer**

[JavaScript: From Workers to Shared Memory](https://lucasfcosta.com/2017/04/30/JavaScript-From-Workers-to-Shared-Memory.html)

[ES proposal: Shared memory and atomics](https://2ality.com/2017/01/shared-array-buffer.html)

[使用 COOP 和 COEP“跨源隔离”网站](https://web.dev/coop-coep/)

* 什麼是 Buffer?

[Node.js 中的缓冲区（Buffer）究竟是什么？](https://juejin.cn/post/6844903897438371847)

[Buffering in Operating System](https://www.javatpoint.com/buffering-in-operating-system)

[\[C/C++\] 指標教學\[四\]: Pass by value vs Pass by reference](https://medium.com/@racktar7743/c-c-%E6%8C%87%E6%A8%99%E6%95%99%E5%AD%B8-%E5%9B%9B-pass-by-value-vs-pass-by-reference-ed5882802789)

* 網站安全性標頭 (header)

[Cross-Origin-Opener-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy)

[Window: opener property](https://developer.mozilla.org/en-US/docs/Web/API/Window/opener)

[Cross-Origin-Embedder-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy)

[^1]: 
