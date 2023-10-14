# Transferable objects - ImageBitmap

**ImageBitmap** 表示一種能夠被繪製到 canvas 元素上的位置圖像，通常是使用 createImageBitmap() 的方式產生，可以看到 **ImageBitmap** 基本上只保存了圖片的寬高資訊

<figure><img src=".gitbook/assets/ImageBitMap 資料.png" alt=""><figcaption></figcaption></figure>

**創建 ImageBitmap**

```javascript
const bitmap = await createImageBitmap(img, sx, sy, sWidth, sHeight);
```

<figure><img src="https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/drawImage/canvas_drawimage.jpg" alt=""><figcaption></figcaption></figure>

*   img&#x20;

    圖片的來源對象，**ImageBitmap** 可以從很多種來源進行創建 (ex. HTMLImageElement, SVGImageElement, HTMLCanvasElement)，[但有些瀏覽器可能尚未支援 SVGImageElement的來源](https://caniuse.com/createimagebitmap)
*   sx & sy

    標記了要從原始圖片的哪個點開始進行裁切
*   sWidth & sHeight

    裁切出的圖片寬高

我想到目前為止 **ImageBitmap** 聽起來還是蠻抽象的，應該要從實際的用法來看會比較好理解：

**從圖片建立 ImageBitmap 並繪製到 Canvas 上 (**[**demo**](https://codesandbox.io/s/imagebitmap-nf5ztf?file=/src/index.mjs)**)**

```javascript
const drawImageOnCanvas = (canvas, imageUrl) => {
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.src = imageUrl;
  img.onload = async () => {
    const width = img.width;
    const height = img.height;

    canvas.width = width;
    canvas.height = height;

    // 創建 bitmap
    const bitmap = await createImageBitmap(img, 0, 0, width, height);

    // 繪製到 canvas 上
    ctx.drawImage(bitmap, 0, 0, width, height);
  };
}
```

**createImageBitmap 額外參數**

在 **createImageBitmap** 的第五個選項，還可以[傳入額外的參數](https://developer.mozilla.org/en-US/docs/Web/API/createImageBitmap)，像是可以垂直翻轉圖片、轉換色彩空間等，這部分設定似乎比較新，某些瀏覽器也不支援

```javascript
const bitmap = await createImageBitmap(img, 0, 0, width, height, option);
```

<pre class="language-javascript"><code class="lang-javascript"><strong>{
</strong><strong>    imageOrientation: 'flipY'
</strong>    premultiplyAlpha: 'premultiply'
    colorSpaceConversion: 'default'
}
</code></pre>

**使用於 web worker**&#x20;

**ImageBitmap** 一樣也是 Transferable objects 的一種，代表他可以直接轉移到 worker 上做進一步處理，但不知道大家有沒有覺得奇怪的地方，按照上面的範例 **ImageBitmap** 最後需要丟到 canvas 中產生圖像，但一開始我們就知道 web worker 是不能直接操作 DOM 元素的，那麽丟到 worker 的 **ImageBitmap** 能做什麼進一步的處理呢？又不能在 worker 中產生 canvas，這時候其實就牽涉到另一個 web api - [**OffscreenCanvas**](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)**，**藉由這個 api 可以做到 worker 中對於 canvas 元素的操作，因此也就可以在 worker 中使用到 ImageBitmap 了。

```javascript
const bitmap = await createImageBitmap(img, 0, 0, width, height);
// 轉移 ImageBitmap 到 worker
worker.postMessage(bitmap, [bitmap]);
```

**小結**

利用 **ImageBitmap** 可以保留各種來源的圖片位置資訊，並進一步繪製到 canvas 上面。



**Reference**

[ImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap)

[createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/createImageBitmap)

