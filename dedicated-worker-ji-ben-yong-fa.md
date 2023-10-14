# Dedicated worker 基本用法

Dedicated worker 是 Web worker 中的一個種類，特色是 Dedicated worker 線程只能被當下創立的主線程操作使用。而主線程與 worker 線程之間最常見的是透過 `postMessage` 進行溝通。

**主線程中創建 worker 線程**

主線程中使用 new Worker() 創建 worker 線程，呼叫 worker.postMessage 可以將資料傳遞給 worker 線程

<pre class="language-javascript"><code class="lang-javascript"><strong>const worker = new Worker('workers.js');
</strong>worker.postMessage('Hi worker!');
</code></pre>

#### worker 線程接收資料

在 worker 線程中 [可以使用 onmessage 或是 addEventListener 獲取資料](https://developer.mozilla.org/en-US/docs/Web/API/Worker/message\_event)，但在 worker 線程中並沒有 window 全域變數，改為使用 [self](https://developer.mozilla.org/en-US/docs/Web/API/Window/self) 取代

```javascript
// 以下兩者等價，可加 self or 不加
onmessage = (e) => {
  console.log(e.data); // 'Hi worker!'
}
self.onmessage = (e) => {
  console.log(e.data); // 'Hi worker!'
}

// 或是以 addEventListener 的方式添加多次監聽
self.addEventListener('message', (e) => {
  console.log('addEventListener', e.data); // 'Hi worker!'
});
```

#### woker 線程傳送資料

在 worker 線程中呼叫 self.postMessage 方法將資料傳回給主線程

```javascript
self.onmessage = (e) => {
  // 將接收到的任何資料，原封不動傳回主線程
  self.postMessage(e.data); // 'Hi worker!'
};
```

**主線程接收資料**

主線程使用 worker.onmessage，接收從 worker 傳來的資料

```javascript
const worker = new Worker('workers.js');
worker.onmessage = (e) => {
  console.log("從 worker 接收到的資料", e.data); // 'Hi worker!'
};
```

**終止 worker 線程**

可以使用 \`worker.terminate\` 立即終止 worker，或是呼叫 worker 線程中的 self.close() 也是一樣的效果，終止後任何傳遞到 worker 的訊息都不再會被接收

```javascript
// 主線程
const worker = new Worker('workers.js');
worker.terminate();

// worker 線程
self.close();
```

**錯誤處理**

當 worker 線程有錯誤時，主線程可以使用 worker.onerror 監聽錯誤

```javascript
const worker = new Worker('./workers.js');
worker.onerror = (error) => {
  console.error('The error from worker', error);
};
```

範例程式碼請參照 [Demo](https://codesandbox.io/s/dedicated-worker-tt7rkr)
