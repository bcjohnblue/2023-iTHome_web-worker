# Web worker 介紹

Javascript 最初就是設計在瀏覽器上執行的語言，而瀏覽器上會有各種的使用者操作，像是輸入文字、點擊按鈕等，這些操作最終都會反映在畫面上的渲染，為了維持畫面上渲染的一致性，Javascript 一開始就是設計成單線程的。但隨著 WebGL 的逐步成熟，在即時 3D 渲染的場景，網頁與 GPU 間需要有大量的資料傳遞，而此時如果繼續只依靠單線程的方式，當運算資源不足時，就有可能出現畫面卡頓的現象造成使用者的體驗不佳。而 Web worker 就是設計來專門解決這種狀況，在正常 UI 渲染的主線程外，創建另一個 worker 線程，worker 線程可以單獨在背景運算而不會影響到主線程的操作。

**Web worker 的特性**

*   **同源限制**

    執行 Web worker 的檔案，必須與主線程運行的檔案同源
*   **多執行緒**

    Web worker 是額外開一個獨立運作的線程，所以不會影響到主線程的運算資源，也就不會拖慢到網頁上畫面的渲染
*   **訊息傳遞**

    Web worker 跟主線程是兩個完全不同的執行環境，所以任何的變數都不能直接取用，必須透過一些特殊的 web api 使兩個線程間互相溝通
*   **限制 DOM 的操作**

    幾乎所有原本在主線程可使用的函式都可以在 worker 中使用 (ex. [Navigator](https://developer.mozilla.org/en-US/docs/Web/API/Navigator), [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/fetch), [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout))，唯一限制是 DOM 相關的操作無法在 worker 中使用 ([window](https://developer.mozilla.org/en-US/docs/Web/API/Window), [document](https://developer.mozilla.org/en-US/docs/Web/API/Document) 等都不存在)

**Web worker 的種類**

*   **Dedicated worker**&#x20;

    一般大家提到 Web worker 時都是指 **Dedicated worker**，指的是創建的 worker 線程只能被當下呼叫他的線程操作使用，其他的線程無法任意取用，使用 [Worker()](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker) 建立。

```javascript
const worker = new Worker('worker.js');
```

*   **Shared worker**

    一般較少提到的 worker，只要是同源的狀況，其他的線程都可以任意取用，包括所有的 window, iframe 等都可以操作存取 Shared worker。

```javascript
const worker = new SharedWorker("worker.js");
```

**小結**

Web worker 通常使用在有大量資料需要運算時的場景，另開一個 worker 線程把資料丟過去並行處理，避免主線程資源負載過重，導致畫面阻塞影響使用者體驗。

**Reference**

[Web Worker 使用教程](https://www.ruanyifeng.com/blog/2018/07/web-worker.html)

[Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web\_Workers\_API/Using\_web\_workers)

[Javascript 之單線程](https://mark-lin.com/posts/20150904/)
