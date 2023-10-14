# ImageData

昨天講到了 **ImageBitmap** 是一種能夠被繪製到 canvas 元素上的位置圖像，今天我們要來講另一個很像的用法 **ImageData，**ImageData 不同於 **ImageBitmap** 的地方就是，它可以對圖片裡面的每一個像素點進行操作，而 ImageData 通常搭配著與 canvas 一起使用，下面我們來看看他的用法：

**創建 ImageData**

利用 createImageData 創建，以下範例創建後 ImageData 寬、高跟原始的 canvas 一樣都是 100\*100，而 data 是有 40000 個元素的 Uint8ClampedArray 矩陣

```javascript
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.rect(0, 0, 100, 100);
ctx.fill();

// ImageData { width: 100, height: 100, data: Uint8ClampedArray[40000] }
console.log(ctx.createImageData(100, 100));
```

那為什麼有 40000 個元素呢？40000 / (100 \* 100) = 4，這代表著圖片上的每個像素點都用了 4 個 Uint8ClampedArray 型別的資料儲存，而每個像素的 4 個資料點對應的就是 RGBA，範圍都是 0\~255，其中最後的 A 指的是 alpha，0 是最透明，255 是最不透明

```javascript
const Uint8ClampedArray = [
    255, 255, 255, 255,  // 第一個像素點: R: 255, G: 255, B: 255, A: 255 => 純白色
    ...
];
```

另外在 ImageData 裡像素的排序是由左到右、上到下依序排列的，所以第 1 個像素點會是左上角，接著的第 2 個像素點會往右邊走，走到 100 個像素點時，會從第 2 列開始，所以上面例子第 2 列的第 1 個像素點儲存的資料會在 Uint8ClampedArray\[401\~404]

**取得 ImageData**

使用 getImageData 可以取得 canvas 的圖片像素資訊，以下範例我們先將整張圖片畫在 canvas 上，接著利用 getImageData 方法取得像素資訊：

```javascript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// 從 (0,0) 原點將整張圖片畫在 canvas 上
ctx.drawImage(img, 0, 0, width, height);
// 取得像素資訊
const imageData = ctx.getImageData(0, 0, width, height);
```

**更新 ImageData**

接續上面範例，以下程式碼將第一個像素設為完全透明的，並更新回 canvas 上：

```javascript
const imageData = ctx.getImageData(0, 0, width, height);
imageData[3] = 0;
ctx.putImageData(imageData, 0, 0);
```



**小結**

**ImageData** 保存著圖片中每個像素的數據，可以精確的改變每個像素的顏色及透明度。



**補充小知識**

1.  什麼是 Uint8ClampedArray ?

    Uint8ClampedArray 跟 Uint8Array 可以保存的數據類型是一樣的，差別是當其中數值超出邊界(小於 0, 大於 255) 時要怎麼處理，Uint8ClampedArray 利用 截斷(clamp) 的方式來處理數值，會將超出範圍的數字，轉換為上下限的數值：

```javascript
// [0, 255, 0]
const uInt8 = new Uint8Array([0, -1, 256]);

// [0, 0, 255]
const uInt8 = new Uint8ClampedArray([0, -1, 256]);
```

而超出邊界的這種狀況叫做 溢位(overflow)，詳細計算方式請參考：[Overflow](https://weihanglo.tw/posts/2017/binary-data-manipulations-in-javascript/#overflow)

2.  **ImageBitmap 跟 ImageData 的差別？**

    **ImageBitmap -** 單純保存了圖片的位置圖像，需要還原或複製圖片時使用

    **ImageData -** 則是保存了圖片所有像素點的資訊，需要修改圖片中的像素點時使用

    Stackoverflow 上有人進行過[分析](https://stackoverflow.com/a/60033582/10090927)，ImageData 因為額外存有像素資訊，所以比使用 ImageBitmap 慢多了，所以當不需要修改圖片的像素時，用 **ImageBitmap** 效能上會好很多

**Reference**

[ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)

[圖片格式簡介(RGBA)](https://ithelp.ithome.com.tw/articles/10216709)

