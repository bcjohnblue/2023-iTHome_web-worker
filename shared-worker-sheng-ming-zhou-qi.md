# Shared worker 生命週期

昨天介紹了 Shared worker 的基本用法，今天打算寫個範例來了解 Shared worker 的生命週期對於不同頁面間的影響

**目的**

1. 了解如何使用 Shared worker 及理解 Shared worker 的生命週期

**說明**

1. 範例中有兩個頁面，分別為 Home page 及 New page，兩個頁面基本上是一樣的，畫面上都有 +1, -1 按鈕，按下去後分別可以傳送訊息給 worker 改變 `count`
2. 兩個頁面都會接收由 worker 傳來的 count 變數，由於 count 變數存在於 worker 線程中，因此只要其中一個頁面的改變 count，另一個頁面也能馬上接收到 count 值的改變

[範例 Demo](https://codesandbox.io/s/shared-worker-9y6hq8)

<figure><img src=".gitbook/assets/截圖 2023-09-24 上午8.20.15.png" alt=""><figcaption></figcaption></figure>

<figure><img src=".gitbook/assets/截圖 2023-09-24 上午8.20.42.png" alt=""><figcaption></figcaption></figure>

**建立 Shared worker 並傳送訊息**

首先建立 Shared worker，並分別在按下按鈕後，postMessage +1 或 -1

```javascript
// 主線程
const worker = new SharedWorker('public/worker.js');

Array.from(document.querySelectorAll('button')).forEach((button) => {
  button.addEventListener('click', (e) => {
    const { className } = e.target;

    switch (className) {
      case 'plus':
        // 傳遞訊息到 worker (+1)
        worker.port.postMessage(1);
        break;
      case 'minus':
        // 傳遞訊息到 worker (-1)
        worker.port.postMessage(-1);
        break;
      default:
        break;
    }
  });
});
```

**Shared worker 接收訊息**

接著在 worker 線程定義兩個參數

* count: 計算點擊數
* ports: 儲存連接到 worker 的所有 port，方便之後統一發送訊息

然後就是當 worker 接收到訊息後，更新 count 的值，並把最新 count 值發送到每個與 worker 有連線的主線程

<pre class="language-javascript"><code class="lang-javascript"><strong>// worker 線程
</strong>let count = 0;
const ports = [];

// 將訊息傳遞到每個與 worker 有連線的主線程中
const postMessageToAllPorts = (data) => {
  ports.forEach((port) => {
    port.postMessage(data);
  });
};

onconnect = (e) => {
  const port = e.ports[0];
  ports.push(port);
  postMessageToAllPorts(count);

  port.addEventListener("message", (e) => {
    count += e.data;
    postMessageToAllPorts(count);
  });

  // 使用 port.addEventListener 寫法時，需要手動 start
  port.start();
};

</code></pre>

**主線程接收訊息**

主線程接收到訊息後，將最新的 count 顯示在畫面上

```javascript
worker.port.onmessage = (e) => {
  document.querySelector('.result').textContent = e.data;
};
```



**小結**

1. 當 Shared worker 接收到訊息時，會送出最新的 `count` 到所有連接的頁面，所以任一頁面改變 `count` 值後，可以看到其他頁面都會顯示最新的 `count` 值
2.  由於 **Shared worker** 可以在同源下的不同頁面被呼叫使用，因此只要這些頁面其中一個還開啟著，Shared worker 檔案裡面的變數就都還是存在的，因此重整頁面後會發現 count 值會有以下兩種狀況：

    case 1. 兩個頁面都開著的狀態下，重整其中一個頁面，會發現 count 的值是最新的

    case 2. 只有一個頁面開著的狀態下，重整頁面，當下 Shared worker 就會被卸載了，所以頁面重整完的 count 值會是初始的 0



**補充小知識**

1.  **在 Chrome 中除錯 Shared worker**&#x20;

    在 Shared worker 中執行 console.log() 時，不會在 devtool 中預設的 console 面板中出現，這時可以在 Chrome 瀏覽器輸入 **chrome://inspect/#workers**，然後點擊 inspect 就可以查看 worker 中 log 出來的訊息了

[How to debug web workers](https://stackoverflow.com/a/26506764/10090927)

### Reference

[SharedWorker](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker)

[The secret of successfully using multi window WebGL Canvas](https://itnext.io/the-secret-of-successfully-using-multi-window-webgl-canvas-5a2d05555ad1)
