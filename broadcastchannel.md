# BroadcastChannel

**BroadcastChannel** 也是 HTML 規範中用來讓多個線程互相溝通的方式，不像昨天所提的 **MessageChannel** 只能做到兩者間的通訊，**BroadcastChannel** 類似廣播以一對多的方式傳送訊息。如下圖所示，**BroadcastChannel** 可以擔任中介者的角色將訊息傳遞給 window, tab 或是 iframe。

<figure><img src="https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API/broadcastchannel.png" alt=""><figcaption><p>From <a href="https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API">MDN</a></p></figcaption></figure>

**創建 BroadcastChannel**

```javascript
const channel = new BroadcastChannel("worker_channel");
```

一開始我們需要為創建的 **BroadcastChannel** 取名，這裡的名稱是 `worker_channel`，之後如果其他頻道也需要進行通信的話，也需要命名成同樣的名稱

**發送訊息**&#x20;

```javascript
channel.postMessage("This is a test message.");
```

一樣用 **postMessage** 的方式將訊息傳遞出去，在傳遞訊息的背後用到的也一樣是前幾天我們所提到的 [structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/Web\_Workers\_API/Structured\_clone\_algorithm) 算法先將訊息進行深複製。但 channel 的 postMessage 本身並沒有第二個 transfer 參數，代表數據的傳遞都一定是複製過的。

**關閉訊息**

當 **BroadcastChannel** 不會再使用到的時候，需要關閉它避免資源消耗。

```javascript
channel.close();
```

**同源傳遞 (same-origin)**

**BroadcastChannel** 的溝通對象之間只允許同源頁面，因此不需要像前兩天介紹到的 MessagePort，接收到訊息需要先驗驗是否從可信任網域來的



**範例**

接著讓我們看 **BroadcastChannel** 要怎麼與 web worker 做搭配，達到各種 worker 間的訊息溝通吧。

[**Demo 連結**](https://codesandbox.io/s/broadcastchannel-in-web-worker-f9pkk3?file=/index.html)

<figure><img src=".gitbook/assets/截圖 2023-09-11 下午10.06.43.png" alt=""><figcaption><p><a href="https://codesandbox.io/s/broadcastchannel-in-web-worker-f9pkk3?file=/index.html">demo 網址</a></p></figcaption></figure>

這裡我簡單寫了一個範例，上面的加法計算會將 `[5, 3]` 的值利用 **BroadcastChannel** 傳遞到 plus-worker 中，而減法計算會將 `[5, 3]` 的值利用 **BroadcastChannel** 傳遞另一個 minus-worker 中，以下是簡短的程式碼說明：



一開始時創建兩個 **BroadcastChannel**，分別用做傳遞給 plus-worker 跟 minus-worker 的通訊管道

```javascript
const plusWorkerChannel = new BroadcastChannel("plus_worker_channel");
const minusWorkerChannel = new BroadcastChannel("minus_worker_channel");
```

接著在按下計算按鈕後，取得輸入框的數值，並分別傳遞到兩個 worker

```javascript
// 按下按鈕後，將數值分別傳到 worker 計算
document.querySelector('button').onclick = () => {
  // 取得加法輸入框 (ex. [5, 3])
  const plusValues = getValues('plus');
  plusWorkerChannel.postMessage(plusValues);

  // 取得減法輸入框數值 (ex. [5, 3])
  const minusValues = getValues('minus');
  minusWorkerChannel.postMessage(minusValues);
};
```

worker 接收到訊息後，分別進行計算，再將結果送回主頁面

**plus-worker.js**

```javascript
const channel = new BroadcastChannel("plus_worker_channel");

channel.onmessage = (e) => {
  console.log("plus-worker 接收到的資料", e.data);

  const [value1, value2] = e.data;
  channel.postMessage(value1 + value2);
};
```

**minus-worker.js**

```javascript
const channel = new BroadcastChannel("minus_worker_channel");

channel.onmessage = (e) => {
  console.log("minus-worker 接收到的資料", e.data);

  const [value1, value2] = e.data;
  channel.postMessage(value1 - value2);
};
```

最後主頁面將兩個 worker 中收到的計算結果渲染回畫面上

```javascript
plusWorkerChannel.onmessage = (e) => {
  const pResult = document.querySelector('.plus-result');
  pResult.textContent = e.data;
}
minusWorkerChannel.onmessage = (e) => {
  const mResult = document.querySelector('.minus-result');
  mResult.textContent = e.data;
}
```



**結論**

利用 **BroadcastChannel** 可以做到一對多的雙向溝通，相比於 **MessageChannel** 來說使用上更靈活，而且其只允許同源溝通的特性，也使得資安上較為安全，不會接收到不同源來的惡意程式碼，但缺點是目前訊息的傳遞似乎都只能完全複製，沒有支援 transfer，或許不適合大量數據傳遞的場景。



**Reference**

[BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
