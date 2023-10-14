# Transferable objects -OffscreenCanvas

昨天我們發現當圖片的解析度很高時，在 canvas 中呼叫 getImageData 會執行很久 (我的電腦 Chrome 瀏覽器耗時 200\~300ms 左右)，但如果想將這段邏輯移到 Web worker 中處理，又會受限於 worker 無法直接對 DOM 元素進行操作的問題。

正是有昨天這種自相矛盾的問題，所以神奇的 Web api - [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) 出現了，OffscreenCanvas 將 canvas 的一些操作 api (getImageData, putImageData 等) 與 DOM 元素解耦，讓我們可以在 worker 中直接對 canvas 進行操作。

OffscreenCanvas 的使用上主要分為兩種：

1.  **對 canvas 中的 ImageBitmap 進行轉換操作**

    這個方式會利用 OffscreenCanvas.transferToImageBitmap 函式將 OffscreenCanvas 轉換為 ImageBitmap，接著再將此 ImageBitmap 餵入ImageBitmapRenderingContext.transferFromImageBitmap 渲染到另一個 canvas 中，這樣最後的 canvas 顯示的就會是在 OffscreenCanvas 中執行的一些色彩操作了

```javascript
const offscreen = new OffscreenCanvas(256, 256);
const context = offscreen.getContext('2d');

// 繪圖在 OffscreenCanvas 上
context.fillStyle = '#FF0000';
context.fillRect(0, 0, offscreen.width, offscreen.height);

// 將 OffscreenCanvas 轉換為 ImageBitmap
const bitmap = offscreen.transferToImageBitmap();

const targetCanvas = document.getElementById('canvas');
const context = canvas.getContext('bitmaprenderer');

// 將 OffscreenCanvas 的 ImageBitmap，丟入 targetCanvas 中渲染
targetCanvas.transferFromImageBitmap(bitmapOne);
```

**與 Web worker 搭配**

以下範例會由主線程發出訊號告知 worker 創建 OffscreenCanvas，並在 worker 中繪製圖像，繪製完後再將 bitmap 傳回給主線程渲染在畫面上

**發出訊號告知 worker 線程繪圖**

```javascript
// 主線程
const worker = new Worker('workers.js');
document.querySelector('button').addEventListener('click', () => {
  worker.postMessage('create-canvas');
})
```

**worker 線程利用 OffscreenCanvas 繪圖**

**worker 繪圖完後利用** transferToImageBitmap 將 bitmap 再轉移回主線程

```javascript
// worker 線程
self.onmessage = () => {
  const offscreen = new OffscreenCanvas(256, 256);
  const context = offscreen.getContext("2d");

  context.fillStyle = "#FF0000";
  context.fillRect(0, 0, offscreen.width, offscreen.height);

  const bitmap = offscreen.transferToImageBitmap();

  self.postMessage({ bitmap }, [bitmap]);
};
```

**主線程接收 ImageBitmap 後繪圖**

主線程接收到 **ImageBitmap** 後，可以利用 transferFromImageBitmap 將 **ImageBitmap** 渲染到指定的 canvas 上

```javascript
// 主線程
const worker = new Worker('workers.js');
worker.addEventListener('message', (e) => {
  const { bitmap } = e.data;
  
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('bitmaprenderer');
  // bitmap 的圖像資訊將會被渲染到 canvas 上
  context.transferFromImageBitmap(bitmap);
});
```

[範例 Demo](https://codesandbox.io/s/web-worker-with-transferfromimagebitmap-86gjmn)



2.  **將 canvas 轉換為 OffscreenCanvas**

    第二個方式則是將 canvas 利用 transferControlToOffscreen 方法，轉換為 OffscreenCanvas，然後這個 OffscreenCanvas 就可以被轉移到 worker 中進行繪圖操作的邏輯，這個方法相較於上面第一個方式較為直覺，也比較常用

```javascript
const canvas = document.getElementById("canvas");
const offscreen = canvas.transferControlToOffscreen();

const worker = new Worker("worker.js");
worker.postMessage({ canvas: offscreen }, [offscreen]);
```

**與 Web worker 搭配**

首先主線程調用 canvas.transferControlToOffscreen 函數後，可以將 OffscreenCanvas 的所有權轉移到 worker 線程

```javascript
// 主線程
const worker = new Worker('workers.js');
document.querySelector('button').addEventListener('click', () => {
  const canvas = document.getElementById('canvas');
  const offscreen = canvas.transferControlToOffscreen();

  worker.postMessage({ canvas: offscreen }, [offscreen]);
})
```

接著 worker 線程就可以直接用一般 canvas 常用的方法操作圖像

```javascript
// worker 線程
self.onmessage = (e) => {
  const { canvas } = e.data;
  const context = canvas.getContext("2d");

  context.fillStyle = "#FF0000";
  context.fillRect(0, 0, canvas.width, canvas.height);
};
```

[範例 Demo](https://codesandbox.io/s/web-worker-with-transfercontroltooffscreen-z7shk4)



**小結**

利用 OffscreenCanvas 可以解耦 canvas 操作圖像方法與 DOM 之間的關係，因此可以達到在 worker 線程中操作圖像，大大的優化了整體效能。



**Reference**



