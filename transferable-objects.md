# Transferable objects

昨天我們瞭解到使用 `postMessage` 時，隨著傳遞的資料越大，耗費的時間就會越久，雖然在桌機上沒什麼問題，但到了手機這種低硬體的環境上，就可能會有效能問題了，此時有另一個可以大大改善效能的方式就是使用 **Transferable objects**。

**Transferable objects** 型態的資料可以在不同的線程中進行 **轉移(transfer)**，可以轉移的資料就不會套用 `postMessage` 預設的 structuredClone 算法，把資料複製過後再傳遞給另一個線程，而是類似傳遞 引用(reference) 的方式，將原本在主線程的資料所有權轉移到 worker 線程中，因為略過了複製資料的步驟，所以效能也可以大幅提高。

**在 postMessage 中傳遞 Transferable objects**

將 **Transferable objects** 代入到 `postMessage` 中的第二個參數就可以將資料轉移到 worker 線程中，下面創建了一個 Uint8Array 型態的資料，並將 uInt8Array.buffer 的資料轉移給 worker 線程。

```javascript
// 創建 Transferable objects (Uint8Array 資料型態)
const uInt8Array = new Uint8Array(1024 * 1).map((v, i) => i);

// 將資料轉移到 worker 線程
worker.postMessage(uInt8Array, [uInt8Array.buffer]);
```

而為了避免資料同步問題，Transferable objects 從一個線程轉移到另一個線程之後，原本的那個線程就不能再操控這筆資料了，因此以上例子的 uInt8Array.byteLength 在轉移過後佔用的記憶體大小為 0。

```javascript
// 創建 1024 bytes 大小的 uInt8Array
const uInt8Array = new Uint8Array(1024 * 1).map((v, i) => i);
console.log(uInt8Array.byteLength); // 1024

worker.postMessage(uInt8Array, [uInt8Array.buffer]);
// 轉移過後資料就不在原本的線程了，所以 byteLength === 0
console.log(uInt8Array.byteLength); // 0
```

另外並不是所有 Javascript 的型別都是可以 **Transferable** 的，像以上例子，可以被轉移的型別是 [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/ArrayBuffer) (uInt8Array.buffer)，如果這裡不小心寫成用 `uInt8Array` 轉移的話會接受到錯誤 `Uncaught DOMException: Failed to execute 'postMessage' on 'Worker': Value at index 0 does not have a transferable type.`



以及之前提到的 `structuredClone` 同樣可以傳遞 **Transferable objects：**

```javascript
// 創建 1024 bytes 大小的 uInt8Array
const uInt8Array = new Uint8Array(1024 * 1).map((v, i) => i);
console.log(uInt8Array.byteLength); // 1024

const transferred = structuredClone(uInt8Array, {
  transfer: [uInt8Array.buffer],
});
console.log(uInt8Array.byteLength); // 0
console.log(transferred.byteLength); // 1024
```



**測試 Transferable objects 效能**

我們將昨天的範例程式稍微改動，增加傳遞 transfer 的參數並比較有無開啟 transfer 之間傳遞速度的差異：

```javascript
const sendMessage = async (data) => {
  return new Promise((resolve) => {
    if (isTransfer) {
      // 將 buffer 資料轉移到 worker
      worker.postMessage(data, [data.buffer]);
    } else {
      // 用預設的 structuredClone 算法
      worker.postMessage(data);
    }

    worker.onmessage = (e) => {
      resolve(e.data);
    };
  });
};
```

<figure><img src=".gitbook/assets/截圖 2023-09-10 上午1.37.59.png" alt=""><figcaption><p>有傳遞 transfer 參數</p></figcaption></figure>

<figure><img src=".gitbook/assets/截圖 2023-09-10 上午1.38.20.png" alt=""><figcaption><p>沒有傳遞 transfer 參數，使用 structuredClone 複製</p></figcaption></figure>

[demo](https://codepen.io/bcjohnblue/pen/yLGMbWw)

可以看到在傳遞 transfer 參數後，所需時間大幅降低了，特別是檔案越大時，兩者執行時間的差異也越大，所以當要傳輸的資料是 **Transferable objects** 時，請用 transfer 參數讓整個[執行速度快如閃電吧](https://developer.chrome.com/blog/transferable-objects-lightning-fast/)。



**Transferable objects 型別**

最後來看看有哪些物件是可以被轉移的呢？ [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web\_Workers\_API/Transferable\_objects#supported\_objects) 中提到支援的有：

* [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/ArrayBuffer)
* [`MessagePort`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort)
* [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
* [`WritableStream`](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream)
* [`TransformStream`](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream)
* [`WebTransportReceiveStream`](https://developer.mozilla.org/en-US/docs/Web/API/WebTransportReceiveStream)
* [`AudioData`](https://developer.mozilla.org/en-US/docs/Web/API/AudioData)
* [`ImageBitmap`](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap)
* [`VideoFrame`](https://developer.mozilla.org/en-US/docs/Web/API/VideoFrame)
* [`OffscreenCanvas`](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
* [`RTCDataChannel`](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel)

有蠻多型別我想是大家一般不常用到，因此也不太熟悉的，所以接下來幾天我打算先介紹這些型別資料的用法，然後再來看看他們在什麼場景下會跟 Web worker 搭配吧～



**Reference**

[Transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web\_Workers\_API/Transferable\_objects)

[Transferable objects - Lightning fast](https://developer.chrome.com/blog/transferable-objects-lightning-fast/)
