# 共享的 Web worker - Shared worker

前面幾天所講的都是屬於一般常用到的 Dedicated worker， Dedicated worker 只能被當下創立的主線程操作使用，而 Shared worker 則是只要符合同源的網域下，任意不同的 window, iframe 或甚至是其他的 worker 線程都可以使用它。

**建立 Shared worker 並傳送訊息**

Shared worker 藉由 MessagePort 達到不同線程之間的溝通，所以需要使用 [port](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/port) 對象傳遞訊息

```javascript
// 主線程
const worker = new SharedWorker('worker.js');
worker.port.postMessage(1);
```

**Shared worker 接收訊息**

不同於 Dedicated worker 只需要使用 [onmessage](https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/message\_event) 方式接收訊息，**Shared worker** 需要在 worker 連接上的時候先呼叫  [`onconnect`](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorkerGlobalScope/connect\_event)，取得連接到 worker 的 port 後，在使用 port 去接收或送出訊息

另外使用 port.addEventListener 或是 port.onmessage 接收訊息時有個小地方得要注意，當使用 port.addEventListener 寫法接收訊息，一定要呼叫 [port.start()](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/start)，才有辦法順利收到訊息，但使用 port.onmessage 方式的寫法，底層會自動呼叫 start()，就不用特別寫出來

範例如下，以下兩段程式碼是等價的：

```javascript
self.onconnect = (e) => {
  const port = e.ports[0];

  port.addEventListener('message', (e) => {
    port.postMessage(e.data);
  });

  port.start();
};
```

```javascript
self.onconnect = (e) => {
  const port = e.ports[0];

  port.onmessage = (e) => {
    port.postMessage(e.data);
  };
};
```

**主線程接收訊息**

跟上面提到的一樣，當使用 addEventListener('message') 的寫法時， port 連線不會自動建立，需要呼叫 port.start() 才能正確收到訊息

```javascript
worker.port.onmessage = (e) => {
  console.log(e.data);
};
```

```javascript
worker.port.addEventListener('message', (e) => {
  console.log(e.data);
});

worker.port.start();
```

**Shared worker 與 Dedicated worker 的生命週期**

Dedicated worker 每次創建時都會是一個新的 worker，只能被創建當下的線程所使用，但 Shared worker 不論被創建了多少次，所有頁面(tab) 則是都共用同一個 worker，以下我們可以看到不同的事件所產生的 worker 數量

**Dedicated worker**

```javascript
const worker = new Worker('/worker.js');
```

| 事件              | 結果          | 總共 worker 數量 |
| --------------- | ----------- | ------------ |
| tab1 創建 worker  | 產生 worker1  | 1            |
| tab2 創建 worker  | 產生 worker2  | 2            |
| 關閉 tab1         | 終止 worker1  | 1            |
| 關閉 tab2         | 終止 worker2  | 0            |

**Shared worker**

```javascript
const worker = new SharedWorker('/worker.js');
```

| 事件                      | 結果                 | 總共 worker 數量 |
| ----------------------- | ------------------ | ------------ |
| tab1 創建 shared worker   | 產生 shared worker1  | 1            |
| tab2 創建 shared worker   | 產生 shared worker2  | 1            |
| 關閉 tab1                 | 終止 shared worker1  | 1            |
| 關閉 tab2                 | 終止 shared worker2  | 0            |

**小結**

今天學習了 Shared worker 的用法及與 Dedicated worker 的不同之處，明天會再寫個範例理解 Shared worker 的生命週期特性

### Reference

[SharedWorker](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker)

[The secret of successfully using multi window WebGL Canvas](https://itnext.io/the-secret-of-successfully-using-multi-window-webgl-canvas-5a2d05555ad1)

[JavaScript Web Workers（三）共享Worker](https://zhuanlan.zhihu.com/p/93473241)
