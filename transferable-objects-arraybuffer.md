# Transferable objects - ArrayBuffer

**ArrayBuffer** 大概是 **Transferable objects** 中最常見的一種了，雖然也是矩陣，但不同於一般使用的矩陣，它是用來創建底層的原始二進制資料。

ArrayBuffer 的使用主要是跟 WebGL 的發展有關，WebGL 允許瀏覽器能夠直接使用到 GPU 進行 二維及三維的圖形渲染，而這種渲染需要大量且即時的二進位制資料交換，而這並不是一般的矩陣所具有的特性，所以才會需要 **ArrayBuffer** 的出現，直接操控一段記憶體區塊，並將數據直接傳輸給 GPU。

**ArrayBuffer** 代表在記憶體中原始的二進位制資料，以下程式產生 32 bytes，初始值為 0 的一段記憶體區塊：

```javascript
const buffer = new ArrayBuffer(32);
```

但產生後的 **ArrayBuffer** 是無法被直接使用的，它代表的只是先分配一塊記憶體空間出來，要操作的話需要使用 [view array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed\_arrays#views)。

**View array**

分為兩種，拿來操作 **ArrayBuffer**

*   **`TypedArray`**

    包含十一種類型，各種類型分別拿來操作不同的資料型態，例如 `Uint8Array` 代表矩陣中的每個元素是無符號8位整數 (數值落在 0 \~255 之間)
*   **`DataView`**

    可以自定義不同的格式類型，例如：第一個 byte 是 Uint8 (無符號8位整數)、第二個 byte 可以是 Float32 (32位浮點數)。

<figure><img src=".gitbook/assets/截圖 2023-09-10 下午6.25.39.png" alt=""><figcaption><p><strong><code>TypedArray</code></strong> 的 11 種類型 From <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays"><code>MDN</code></a></p></figcaption></figure>

**TypedArray 初始化**

```javascript
const i16 = new Int16Array(4); // 4 * 2 = 8 bytes
console.log(i16.byteLength); // 8
```

**TypedArray 也可以從 ArrayBuffer 建立**

```javascript
const buffer = new ArrayBuffer(4);
const i32 = new Int32Array(buffer); // 4 bytes
console.log(i32.byteLength); // 4
```

**DataView 創建不同種類的矩陣**

```javascript
const buffer = new ArrayBuffer(4);

const view = new DataView(buffer);
view.setUint8(1, 255); // Max unsigned 8-bit integer
view.setUint16(1, 65535); // Max unsigned 16-bit integer

console.log(view.getUint8(1)); // 255
console.log(view.getUint16(1)); // 65535
```

最基本的操作大概是這些，ArrayBuffer 其實還有很多可以了解的地方，但我想已經有很多其他優秀的文章專門講解過這一塊了，像是 [使用 JavaScript 處理二進位資料](https://blog.techbridge.cc/2017/09/24/binary-data-manipulations-in-javascript/)，推薦大家去看看\~ 可以額外學到很多東西。



**補充小知識**

1.  Array 與 ArrayBuffer 之間的區別

    在第一段中提到，ArrayBuffer 用來直接產生二進位制資料與 WebGL 直接溝通，可以使得整個溝通更為快速，但為什麼平常我們使用的 Array 就做不到這件事呢？原因是一般 Array 其在 JS v8 引擎中的實現並不是直接操作記憶體位置產生，而是背後有一連串複雜的算法，所以即使只是產生一個簡單數值的矩陣，卻會額外創建很多不一定會被用到的記憶體空間。

```javascript
// 假設我們想要產生一個 [42] 的矩陣：

// 一般產生方式 
const arr = [];
arr.push(42);

// 使用 ArrayBuffer 產生
const buffer = new ArrayBuffer(1);
const bufferArr = new Uint8Array(buffer);
bufferArr[0] = 42;
```

下面由 buffer 產生的矩陣，總共佔了 1 byte 的記憶體空間，但上面那個呢？根據 [\[V8 Deep Dives\] Understanding Array Internals](https://itnext.io/v8-deep-dives-understanding-array-internals-5b17d7a28ecc) 所做的測試，在 64位元的電腦上，總共會佔據 17\*8 = 136 bytes 的空間！想想光是一個數值的矩陣，記憶體的差異就可以達到一百多倍，這樣當需要大量即時資料與 WebGL 溝通時將會變得多麽慢。因此當牽涉到 WebGL 等 3D 運算的時候都是使用 ArrayBuffer。

(P.S. 這一段是我尋找各個不同資料加上個人理解所寫出，如果理解錯誤的話再請幫忙指正)



**Reference**

[ECMAScript 6 入门（第三版）ArrayBuffer](https://wizardforcel.gitbooks.io/es6-tutorial-3e/content/docs/arraybuffer.html)

[使用 JavaScript 處理二進位資料](https://blog.techbridge.cc/2017/09/24/binary-data-manipulations-in-javascript/)

[\[V8 Deep Dives\] Understanding Array Internals](https://itnext.io/v8-deep-dives-understanding-array-internals-5b17d7a28ecc)

[从Chrome源码看JS Array的实现](https://zhuanlan.zhihu.com/p/26388217)

[JavaScript 陣列的進化與效能分析](https://www.itread01.com/article/1505716487.html)
