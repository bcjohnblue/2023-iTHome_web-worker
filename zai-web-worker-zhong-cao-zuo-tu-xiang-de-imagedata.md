# 在 Web worker 中操作圖像的 ImageData

昨天我們講解了 ImageData 的各種方法，今天讓我們寫個範例，測試看看 Web worker 在處理 ImageData 時如何增進效能吧。

[程式碼 Demo](https://codesandbox.io/s/using-web-worker-with-imagedata-8xl4kc)

**目的**

1. 利用 **ImageData** 操作圖片的個別像素，讓圖片的外圍區域變的透明，最後渲染在 canvas 上。
2. 因為 **ImageData** 的資料型別 Uint8ClampedArray 是一種 TypeArray，所以我們可以使用其中的 .buffer 屬性取得 ArrayBuffer，接著將其 transfer 到 Web worker 裡對個別像素進行處理，這部分是希望能利用 Web worker 增進效能的地方。

**說明**

1. 範例中會有兩個變數可調整數值，分別是 boundingOpacity: 調整透明度、boundingRatio: 調整圖片外框影響比例。
2. 範例中會有兩部分程式都是用同樣的邏輯操作 **ImageData**，但其中一個丟到 Web worker 處理，另一個單純在主線程裡運行。
3. 在可能的耗時操作前後都會計算經過的時間並顯示在畫面上。
4. 為了能更明顯的看出 Web worker 是否能避免主線程 UI 渲染阻塞，畫面上方會有一個紅色方塊隨著時間進行動畫，當按下按鈕，執行操作 **ImageData** 時，可以觀察動畫是否會卡頓。

<figure><img src=".gitbook/assets/截圖 2023-09-17 上午10.37.05.png" alt=""><figcaption></figcaption></figure>

首先我們先看點擊 **使用 worker** 及 **不使用 worker 按鈕時** 執行的程式碼，主要是根據點擊的按鈕執行不同的函數，並且在執行前後使用 [performance.now()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) 計算函數執行時間，之後分別執行 `renderCanvas` 將處理過後的 canvas 畫在畫面上，以及 renderTime 將執行程式的時間顯示在畫面上。

```javascript
const mapClassNameToFunction = {
  worker: makeImageBoundaryTransparentWithWorker,
  'no-worker': makeImageBoundaryTransparent
};

Array.from(document.querySelectorAll('button')).forEach((button) => {
  button.addEventListener('click', async (e) => {
    const originImg = document.querySelector('.origin');
    const imageUrl = originImg.src;

    // 透明度
    const boundingOpacity =
      document.querySelector('.bounding-opacity').value || 0.5;
    // 圖片外框影響比例
    const boundingRatio =
      document.querySelector('.bounding-ratio').value || 0.05;

    // 操作 ImageData 函數
    const fn = mapClassNameToFunction[e.target.className];

    const start = performance.now();
    const { canvas, time } = await fn(imageUrl, {
      boundingOpacity,
      boundingRatio
    });
    // 將處理過後的 canvas 畫在畫面上
    renderCanvas(canvas);
    const end = performance.now();
    time.total = Math.round(end - start);

    // 將執行程式的耗時顯示在畫面上
    renderTime(time);
  });
});
```

由於 **使用 worker** 或是 **不使用 worker** 進行 ImageData 的操作背後的邏輯是一樣的，所以下面我們只專注在使用 worker 時執行的邏輯

**取出 ImageData**

首先執行 ctx.getImageData 拿出圖片中的 ImageData，由於 getImageData 的執行可能耗費許多時間，所以我們也測量這段耗費的時間

```javascript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const time = {};

// 測量 drawImage, getImageData 的耗時
start = performance.now();

// 在 canvas 上畫出 img 圖片
ctx.drawImage(img, 0, 0, width, height);
// 取出 ImageData
const imageData = ctx.getImageData(0, 0, width, height);

end = performance.now();
time.getImageData = Math.round(end - start);
```

**將 ImageData 轉移到 worker**

由於 **ImageData** 是 TypeArray 型別，可以使用其中的 buffer 屬性將其轉移 (transfer) 到 worker 中進一步處理

```javascript
worker.postMessage({ imageData, option }, [imageData.data.buffer]);
```

**worker 中操作 ImageData 設置透明度**

worker 線程中會執行 makeImageDataTransparent 函式遍歷 **ImageData** 中的像素點，改變圖片外圍像素點的透明度，然後再將算完的 newImageData 回傳主線程，此時也會計算消耗的時間

```javascript
self.onmessage = async (e) => {
  const { imageData, option } = e.data;

  const start = performance.now();
  const newImageData = await makeImageDataTransparent(imageData, option);
  const end = performance.now();

  self.postMessage({ newImageData, newImageDataTime: end - start }, [
    newImageData.data.buffer
  ]);
};
```

**主線程接收操作過的 ImageData**

最後將處理過後的 newImageData 利用 ctx.putImageData 更新回 canvas 上

```javascript
worker.onmessage = (e) => {
  const { newImageData, newImageDataTime } = e.data;
  time.imageDataTime = Math.round(newImageDataTime);
  
  start = performance.now();
  ctx.putImageData(newImageData, 0, 0);
  end = performance.now();
  time.putImageData = Math.round(end - start);
};
```



**小結**

原本單純利用主線程運算 **ImageData**，會導致動畫有些許的卡頓，而將這部分的運算移到 **worker** 處理後，可以發現按下按鈕後動畫不再卡頓。



**對高解析度的圖片進行處理**

各位可以修改程式碼把 index.html 中改為渲染高解度的圖片，這時會發現即使使用 worker 動畫卡頓的問題一樣會出現，原因是當圖片解析度變高時，getImageData 執行的時間會大幅上升，而 getImageData 並沒有移到 worker 中執行，所以依舊會造成卡頓。我們知道 worker 中是沒有辦法操作 DOM 的，而 getImageData 本身是源自於 canvas 的函式，所以當然也不能在 worker 中使用。

雖然 worker 並不能直接操作 DOM，但瀏覽器提供了一個特別的 api OffscreenCanvas，OffscreenCanvas 可以將 DOM 與圖像操作的邏輯解耦，進而做到在 worker 中呼叫 getImageData 方法，那麼明天我們將會來看看要怎麼利用 OffscreenCanvas 繼續優化



**補充小知識**

1.  什麼是被污染的畫布 (tainted canvas) ?

    不知道大家有沒有注意到 execution.js 中的一行程式碼

```javascript
const img = new Image();
img.crossOrigin = "Anonymous";
```

為什麼這裡需要設定圖片的 crossOrigin 屬性呢？大家可以嘗試看看，如果不加這行的話，當執行 getImageData 方法時會直接丟出錯誤 SecurityError Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The canvas has been tainted by cross-origin data.

原因是圖片的來源可能是 跨域(CORS) 的，在自己的網站獲取其他網站圖片中像素本身是會有安全性問題的，所以當沒有設定 crossOrigin 時，就會有以上的錯誤丟出，而將 crossOrigin 設定成 "Anonymous" 後，會告知瀏覽器說，這個圖片我打算用 CORS 的方式獲取，那麼這時候就會觸發瀏覽器的 CORS 檢查機制，也就是圖片必須回傳 Access-Control-Allow-Origin 的 header 資訊：

```vhdl
Access-Control-Allow-Origin "*"
```

讓瀏覽器知道這個圖片是允許被跨域存取的，如此才有辦法使用 getImageData 方法獲取圖片中的每個像素值

[Allowing cross-origin use of images and canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS\_enabled\_image#security\_and\_tainted\_canvases)

[How to fix getImageData() error The canvas has been tainted by cross-origin data?](https://stackoverflow.com/a/27840082/10090927)

2.  使用 Chrome 瀏覽器執行 getImageData 速度的差異

    大家在執行 demo 範例的時候不知道有沒有發現一個神奇的事情，使用 Chrome 瀏覽器時，第一次執行 getImageData 時，速度明顯比第二次之後的執行 getImageData 慢很多，原因似乎是因為 Chrome 瀏覽器目前都用 GPU 處理所有跟 canvas 相關的操作，但有一個問題是 GPU 運行 getImageData 的速度明顯慢於 CPU，所以 Chrome 決定將第一個 getImageData 的呼叫在 GPU 上運行，而後續的 getImageData 呼叫都在 CPU 上運行，於是就導致了第一次呼叫時速度很慢，但之後就都變快的神奇現象

    [Canvas painting time issue with getImageData() in game loop](https://stackoverflow.com/a/70643498/10090927)

<figure><img src=".gitbook/assets/截圖 2023-09-22 下午4.38.13.png" alt=""><figcaption><p>第一次呼叫 getImageData - 使用 GPU 速度很慢</p></figcaption></figure>

<figure><img src=".gitbook/assets/截圖 2023-09-22 下午4.40.06.png" alt=""><figcaption><p>第二次之後呼叫 getImageData - 使用 CPU 速度變快</p></figcaption></figure>

**未解問題**

**Safari 載入圖片很慢**



**Reference**



