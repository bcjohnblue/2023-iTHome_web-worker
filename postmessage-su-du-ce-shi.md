# postMessage 速度測試

昨天提到 `postMessage` 背後使用了 [structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone) 算法將資料 **深複製 (deep copy)** 後再進行傳遞，雖然這樣保證了資料的完整性(不同線程間無法修改其他線程的資料)，但隨之而來的缺點是當資料量非常大的時候，複製再傳遞的過程會耗費更多時間，今天讓我們來測試看看將不同資料經由 postMessage 傳遞所花費的時間。

測試的時間範圍單純計算從主線程發送 postMessage => worker 接收到 message => 主線程接收到 message，這段大致程式碼如下：

```javascript
const sendMessage = async (data) => {
  return new Promise((resolve) => {
    worker.postMessage(data);
    worker.onmessage = (e) => {
      resolve(e.data);
    };
  });
};

const start = performance.now();
await sendMessage(data);
const end = performance.now();
const time = end - start;
console.log(`傳遞花費時間：`, `${(time)} ms`);
```

然後產生測試的資料，這裡拿處理 3d 渲染時最常使用到的資料型態 ArrayBuffer，按檔案大小產生從 1KB 到 1GB 的資料，使用以下的函式創建：

```javascript
function generateRandomArray(size) {
  const t1 = performance.now();
  // value 單位是 Bytes (ex. 1KB 的 value = 1024)
  const data = new Uint8Array(new ArrayBuffer(value)).map((_, i) => i);
  const t2 = performance.now();
  console.log(`創建 Array 經過時間：`, `${t2 - t1} ms`);
  return data;
}
```

<figure><img src=".gitbook/assets/截圖 2023-09-09 下午11.25.45.png" alt=""><figcaption><p>測試結果 (Chrome 116, Macbook)</p></figcaption></figure>

在我的電腦上跑所需的耗時如上圖，可以看出如果要符合 [RAIL 性能規範](https://web.dev/rail/) 建議，在 50ms 以內回應使用者的操作，基本上在 100 MB 以下的資料操作都沒什麼問題，但要注意的是在硬體不夠強的手機上，能夠處理資料的上限肯定會更少。

這裡提供 [demo](https://codepen.io/bcjohnblue/pen/jOXBbWJ)，有興趣的話可以試試在不同的裝置上跑分的結果。



最後想分享的這篇文章 - [Is postMessage slow?](https://surma.dev/things/is-postmessage-slow/) ，作者做了更詳細的測試，包含了各個瀏覽器及電腦、手機跑出來的結果，另外作者在測試 postMessage 時只單獨測試了 **StructuredDeserialize** 的這部分。
