# 在 Web worker 中使用 opencv.js

終於到了文章中的最後一個範例，這一連串的系列文的起因一切都是 第1天的文章...，所以最後就讓我來完成第一天所說的在 Web worker 中使用 opencv.js 吧

### 什麼是 opencv.js ？

先前情提要一下什麼是 opencv.js

opencv.js 是 OpenCV（Open Source Computer Vision Library）的 JavaScript 版本。 它是 OpenCV 函式庫的子項目，透過使用 Emscripten 技術，將原始的 C++ 程式碼編譯成 JavaScript，使得開發者可以在瀏覽器中直接執行 OpenCV 的功能。 OpenCV 提供了一些圖像處理的功能，例如：濾波、邊緣檢測、顏色轉換、人臉識別等

有興趣了解的人可以參考 [官方 opencv.js 教學](https://docs.opencv.org/3.4/d5/d10/tutorial\_js\_root.html)

### 範例

[範例 Demo](https://codesandbox.io/s/using-opencv-in-web-worker-7hvgnk)

<figure><img src=".gitbook/assets/截圖 2023-10-11 下午11.03.14.png" alt=""><figcaption></figcaption></figure>

**目的**

1. 結合 Web worker 與 opencv.js，比較使用 Web worker 前後效能的差異

**說明**

1. 假設圖片中較亮的地方是可能的恆星或星系所在位置，可以利用 opencv.js 的輪廓檢測，找出這些星星的位置，並以綠色亮點標記出來
2. 畫面上方有個拖拉元件(slider)，隨著拖拉的移動，判定找到的星星會越多
3. 在拖拉的過程中都會呼叫 opencv 的算法，預期這部分的操作會佔用到主線程的資源導致畫面卡頓
4. 當勾選上方的 **使用 web worker** 後會將 opencv 的算法移到 Web worker 中做處理&#x20;
5. 最後比較有無 **使用 web worker** 對於效能的影響

#### 偵測使用者拉動的 slider

在使用者拉動 slider 時，會根據改變的值 (0\~100%) 當作參數去尋找畫面上的亮點

```javascript
document.querySelector('#slider').addEventListener('change', async (e) => {
  const checkbox = document.querySelector('#use-worker');
  const isUsingWorker = checkbox.checked;

  // 拖動範圍 0 ~ 100%
  const percent = e.detail;

  if (isUsingWorker) {
    // 使用 Web worker 尋找亮點
    await findStarsWithWorker(percent);
  } else {
    // 不使用 Web worker 尋找亮點
    findStarsWithoutWorker(percent);
  }
});
```

#### 不使用 Web worker 尋找亮點 (findStarsWithoutWorker)

先來看 **不使用 worker 找亮點** 的部分

在 opencv.js 中可以使用 cv.imread()，將圖片或是 canvas 等讀進來，而這裡帶入的是 **canvas 元件的 id (#canvasInput)**

接著中間會有一長串的程式碼，主要利用 [cv.findContours](https://docs.opencv.org/3.4/d5/daa/tutorial\_js\_contours\_begin.html)，找出星星的輪廓後標記成綠色亮點，這一部分的程式因為跟 Web worker 比較沒關係就不仔細說明了，有興趣的人可以參考以下文章：

[OpenCV 輪廓檢測- contour detection(籃網偵測,字母模板偵測) ](https://hackmd.io/@cws0701/S1FrckXhc)

[追蹤並標記特定顏色](https://steam.oxxostudio.tw/category/python/ai/opencv-color-tracking.html)

當找出綠色星星亮點後，會將 **結果圖像(outputMat)** 利用 cv.imshow()，顯示在 **canvas 上(#canvasOutput)**

<pre class="language-javascript"><code class="lang-javascript"><strong>export const findStarsWithoutWorker = (percent = 0) => {
</strong>  // 讀入原始星空圖
  const inputMat = cv.imread('canvasInput');

  // 初始 percent 為 0，不做任何處理回傳原始圖
  if (!percent) {
    cv.imshow('canvasOutput', inputMat);
    inputMat.delete();
    return;
  }

  // 使用 opencv 尋找亮點邏輯 (省略...)
  // ...

  // 在瀏覽器中顯示結果圖像
  cv.imshow('canvasOutput', outputMat);
};
</code></pre>

#### 使用 Web worker 尋找亮點(findStarsWithWorker)

由於使用 cv.imread() 載入圖片後回傳的是 opencv 特有的 cv.Mat 資料格式，而 cv.Mat 是無法經由 postMessage 的 structuredClone 算法後傳遞到 worker 線程中的

```javascript
// 主線程
const inputMat = cv.imread('canvasInput');
worker.postMessage(inputMat);

// worker 線程
self.onmessage = (e) => {
    // cv.Mat 資料無法被複製
    console.log(e.data); // {}
}
```

因此我們需要先將 cv.Mat 使用 matToImageData 函式轉換為 第x天所提到的 imageData 型態，才能傳到 postMessage 中，注意這裡 postMessage 有設定第二個參數將 imageData 的 buffer 轉移到 worker 線程，可以略過資料複製讓 postMessage 傳遞速度更快

#### 傳遞圖像資料到 worker 線程

```javascript
export const findStarsWithWorker = (percent) => {
  return new Promise((resolve) => {
    const inputMat = cv.imread('canvasInput');
    const imageData = matToImageData(inputMat);

    worker.postMessage(
      {
        imageData,
        percent
      },
      [imageData.data.buffer]
    );
  });
};
```

#### worker 線程處理圖像資料

worker 線程接到 imageData 後需要先轉換為 cv.Mat 的形式，才能做接下來的 opencv 運算，這一部分的運算跟 **不使用 Web worker 尋找亮點 (findStarsWithoutWorker)** 一樣，差別只在運算完後需要再把 cv.Mat 轉換成 imageData 後才能傳到主線程

```javascript
self.onmessage = (e) => {
  findStarsInWorker(e.data);
};

function findStarsInWorker({ imageData, percent = 0 }) {
  const inputMat = cv.matFromImageData(imageData);
  
  if (!percent) {
    // 將處理後的圖像資料傳回主線程
    const processedImageData = matToImageData(inputMat);
    self.postMessage({ imageData: processedImageData }, [
      processedImageData.data.buffer
    ]);

    inputMat.delete();
    return;
  }
  
  // 使用 opencv 尋找亮點邏輯 (省略...)
  // ...

  // 將處理後的圖像資料傳回主線程
  const processedImageData = matToImageData(outputMat);
  self.postMessage({ imageData: processedImageData }, [
    processedImageData.data.buffer
  ]);  
}
```

#### 主線程接收圖像資料

最後主線程接收到 imageData 後使用 putImageData 就可以畫在結果圖像上

```javascript
export const findStarsWithWorker = (percent) => {
  return new Promise((resolve) => {
    // ...
    // ...
    // ...
    
    worker.onmessage = (e) => {
      const outputCanvas = document.querySelector('#canvasOutput');
      outputCanvas.getContext('2d').putImageData(e.data.imageData, 0, 0);

      resolve();
    };
  });
};
```

###

### 結果

<figure><img src=".gitbook/assets/截圖 2023-10-13 上午1.17.54.png" alt=""><figcaption></figcaption></figure>

<figure><img src=".gitbook/assets/截圖 2023-10-13 上午1.19.52.png" alt=""><figcaption></figcaption></figure>

1. 這個尋找星星的範例中，使用 opencv 執行的時間不會到很長，所以不論有無開啟 worker，兩者的運算時間在我的電腦上測試大概都是 10\~30ms 間
2. 但 10\~30ms 間的執行時間也足夠使得使用者在快速拖拉時會感覺到明顯的卡頓了，這時我們可以發現 **沒有使用 worker**  的狀況下，拖拉時偶爾會卡住，但 **使用 worker 時**，因為 opencv 的邏輯都移到 worker 線程處理，所以一樣可以拖拉的很順暢&#x20;

### **總結**

opencv.js 可以做到圖像辨識、邊緣偵測等許多的功能，但在網頁上使用 opencv.js 可能會很耗費時間，當耗費的時間嚴重到會影響到畫面 UI 操作時，可以考慮將相關的運算邏輯移到 worker 線程中處理，優化使用者體驗



### Reference

[Getting Started with Images](https://docs.opencv.org/3.4/df/d24/tutorial\_js\_image\_display.html)

[学习opencv.js(1)图像入门](https://blog.csdn.net/qq\_52580376/article/details/123161258)

[Contours : Getting Started](https://docs.opencv.org/3.4/d5/daa/tutorial\_js\_contours\_begin.html)
