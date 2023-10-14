# 在 Web worker 中使用 OffscreenCanvas

昨天我們學到了可以使用 OffscreenCanvas 在 Web worker 中操作圖像，如此一來就可以避免主線程在處理 canvas 時可能會有的卡頓狀況，那麼今天就讓我們接續優化前兩天的程式碼，改用 OffscreenCanvas 來實作看效能可以優化多少

[程式碼 Demo](https://codesandbox.io/s/using-offscreencanvas-in-web-worker-nx4q2j)

**目的**

1. 接續前兩天的範例，但圖像操作的部分，都改成在 worker 中使用 OffscreenCanvas 來看是否可以進一步增進效能

**說明**

1. 原先的範例中，將 **操作圖片像素(ImageData)** 的運算改用 worker 處理已經不會讓主線程的動畫卡頓，但當圖片畫質過高，**取得圖片像素(getImageData)** 所耗費的時間有可能達到 100\~200ms，這種狀況還是一樣可以看到動畫卡頓
2. 今天的範例打算使用 **OffscreenCanvas，**將 **取得圖片像素(getImageData)** 的邏輯也移到 worker 中處理。希望最後能驗證不論圖片的畫質多高，只要將操作圖像的邏輯移到 worker 中執行，都不會造成主線程的動畫卡頓
3. 今天的範例會新增 **使用 worker (OffscreenCanvas) 按鈕**，按下後執行操作圖像的邏輯都會使用 **OffscreenCanvas** 於 worker 線程中處理

<figure><img src=".gitbook/assets/截圖 2023-09-22 下午3.03.37.png" alt=""><figcaption></figcaption></figure>

首先我們新增了一個 **使用 worker (OffscreenCanvas) 按鈕**，按下去後會產生 **OffscreenCanvas ，**並將 **OffscreenCanvas** 傳遞到 worker

```javascript
// 主線程
const offscreenCanvasWorker = new Worker("offscreen-canvas-worker.js");

const canvas = document.createElement("canvas");
const offscreen = canvas.transferControlToOffscreen();

// 將 OffscreenCanvas 傳遞到 worker
offscreenCanvasWorker.postMessage(
  { canvas: offscreen, imageUrl },
  [offscreen]
);
```

**從網路 fetch Image 圖片**

由於 worker 中無法控制 DOM 元素，因此原本使用的 `new Image()` 加載圖片的方式變得不可行，所以改用 fetch 的方式將圖片從網路拿回來，並轉成之後需要用到的 [blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) 格式

```javascript
// worker 線程
const fetchImageBlob = async (imageUrl) => {
  const response = await fetch(imageUrl);
  const imageBlob = await response.blob();
  return imageBlob;
};
```

**將圖片從 blob 轉為 ImageBitmap**

接著將圖片從 blob 轉為 **ImageBitmap** 型別，以供下一步的 [drawImage](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage) 函式使用

```javascript
// worker 線程
const bitmap = await createImageBitmap(imageBlob);
```

**將 ImageBitmap 繪製到 canvas**

將以上準備好的 **ImageBitmap** 丟進主線程傳來的 **canvas** 繪製

```javascript
// worker 線程

// canvas 為從主線程傳來的 OffscreenCanvas
const ctx = canvas.getContext("2d"); 

const width = bitmap.width;
const height = bitmap.height;
canvas.width = width;
canvas.height = height;

ctx.drawImage(bitmap, 0, 0, width, height);
```

**利用 OffscreenCanvas 操作圖像**

接下來的步驟就跟原先的一樣，先取得 ImageData 後再執行圖像外框透明化的像素操作，最後利用 putImageData 將 ImageData 更新回 **OffscreenCanvas**

```javascript
// worker 線程
const imageData = ctx.getImageData(0, 0, width, height);

const newImageData = makeImageDataTransparent(imageData, option);
ctx.putImageData(newImageData, 0, 0);
```

**主線程中將 canvas 渲染到畫面上**

到目前為止，worker 線程中的 canvas 都處理完操作圖像的邏輯了，由於 worker 中的 canvas 是從主線程傳來的，所以最後只需要將主線程一開始傳入的 canvas 渲染在畫面上

```javascript
// 主線程
const offscreenCanvasWorker = new Worker("offscreen-canvas-worker.js");

const canvas = document.createElement("canvas");
const offscreen = canvas.transferControlToOffscreen();

offscreenCanvasWorker.postMessage(
  { canvas: offscreen, imageUrl },
  [offscreen]
);
offscreenCanvasWorker.onmessage = () => {
  // 將 worker 處理過的 canvas 渲染在畫面上
  renderCanvas(canvas);
};
```

**結果**

<figure><img src=".gitbook/assets/截圖 2023-09-22 下午5.16.22.png" alt=""><figcaption></figcaption></figure>

1. 原本預期想要用 **OffscreenCanvas** 改善效能似乎沒有想像中的順利，可以發現按下按鈕後，動畫一樣會有卡頓的現象，看來瓶頸一樣是當執行 getImageData 時會佔用到主線程的資源，推測原因可能是 canvas 一開始就是由主線程傳到 worker 線程，而在 worker 線程呼叫 getImageData 時，主線程一樣需要資源把任何操作圖像的邏輯回寫到主線程的 canvas 上
2. 但無論如何將操作像素(ImageData)的邏輯移到 worker 中處理，還是能夠增進效能，大幅降低主線程的動畫卡頓



補充：

今天的範例中用到了 `createImageBitmap`，將 blob 轉換為 ImageBitmap 型態的資料，但 [Safari 似乎還不支援以 blob 參數傳入的方式](https://caniuse.com/createimagebitmap)，我實測在 Safari 中結果圖片會跑不出來，但也沒有錯誤訊息出現

```javascript
// Safari 似乎無法正常處理傳入 blob 格式的資料
const bitmap = await createImageBitmap(imageBlob);
```



**Reference**

[Loading Images with Web Workers](https://trezy.com/blog/loading-images-with-web-workers)



