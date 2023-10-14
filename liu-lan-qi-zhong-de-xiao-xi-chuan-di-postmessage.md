# 瀏覽器中的消息傳遞 - postMessage

在前面學習關於 Web worker 的知識時，我發現了不同地方都會有所謂的 postMessage 函式把訊息發送出去，但各種 postMessage 實際使用的方式卻有點不同，所以今天這篇文章希望統整這些 postMessage 使用的方式及差異

### postMessage 種類

目前 MDN 上列出的大致上有六種

* [window.postMessage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage)
* [Worker.postMessage](https://developer.mozilla.org/zh-CN/docs/Web/API/Worker/postMessage)
* [ServiceWorker.postMessage](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker/postMessage)
* [Client.postMessage](https://developer.mozilla.org/zh-CN/docs/Web/API/Client/postMessage)
* [MessagePort: postMessage](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/postMessage)
* [BroadcastChannel.postMessage](https://developer.mozilla.org/zh-CN/docs/Web/API/BroadcastChannel/postMessage)

## window.postMessage

window.postMessage 通常使用在需要與 iframe 溝通的場景&#x20;

當主頁面中有 iframe 存在，可以使用 [iframe.contentWindow](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLIFrameElement/contentWindow) 去取得 iframe 中的 window

```javascript
const iframe = document.querySelector("iframe");
iframe.onload = () => {
  // 取得 iframe 裡的 window 屬性 
  const iframeWindow = iframe.contentWindow;
};
```

取得 iframeWindow 後，就可以直接利用這個屬性去操作 iframe 裡的一些東西，例如改變整個 iframe 網頁的背景顏色：

```javascript
iframeWindow.document.querySelector("body").style.backgroundColor = "blue";
```

但有個問題是，以上的操作都限定在主頁面與 iframe 網頁是同源網站，如果主頁面跟 iframe 網頁不同源的話，瀏覽器會限制只能拿到某些特定的 window 的屬性 (ex. [window.opener](https://developer.mozilla.org/en-US/docs/Web/API/Window/opener)、[window.location](https://developer.mozilla.org/en-US/docs/Web/API/Window/location) )，詳細的限制屬性請看 [跨域腳本API訪問](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin\_policy#cross-origin\_script\_api\_access)，

所以當不同的 window, iframe 間是不同源的狀況下，無法使用上面的方式拿到另一個頁面的資料，此時需要使用 window.postMessage

```javascript
postMessage(message, targetOrigin, [transfer])
```

* message: 傳送的訊息，會先被 structuredClone 算法複製後再傳送
* targetOrigin: 目標視窗的網域地址，可以使用 "\*" 代表傳遞訊息到任意網域，但避免將洩漏敏感訊息到惡意網站，最好都提供固定的網域地址
* transfer: 可選擇傳遞 Transferable objects 轉移物件所有權到另一個目標視窗

而在另一個接收訊息的網頁使用 addEventListener('message') 接收訊息，為了避免從任意網站接收到惡意訊息，檢查 訊息的發送網域(event.origin) 後再執行相關操作較為安全

```javascript
window.addEventListener('message', (event) => {
  // 確認訊息從可信任網域，執行接下來的操作
  if (event.origin === 'http://trust-website.org') {
    // 從 e.data 拿出傳來的訊息 
    console.log(event.data);
  }
})
```

以上述更改 iframe 網頁的背景顏色為例，改用 window.postMessage 的寫法如下：

```javascript
// 主視窗 (http://main.example.com)
const iframe = document.querySelector("iframe");
iframe.onload = () => {
  // 取得 iframe 裡的 window 屬性 
  const iframeWindow = iframe.contentWindow;
  iframeWindow.postMessage({ backgroundColor: 'blue' }, );
};
```

```javascript
// iframe 視窗 (http://iframe.example.com)
window.addEventListener('message', (e) => {
  if (event.origin === 'http://main.example.com') {
    const { backgroundColor } = e.data;
    document.querySelector("body").style.backgroundColor = backgroundColor;
  }
});
```

### **Worker.postMessage**

Web worker 中的 postMessage 在之前的文章中已經多次出現，可以前往 第三天的部分，查看更多細節的介紹



### ServiceWorker**.postMessage**

使用 Service Worker 可以快取檔案，達到即使離線狀態也能正常瀏覽網頁等功能。

ServiceWorker**.**postMessage 可以從主視窗向 service worker 發送訊息：

```javascript
// 主視窗

// 註冊 service worker
navigator.serviceWorker.register("service-worker.js");

navigator.serviceWorker.ready.then((registration) => {
  // 發送訊息到 service-worker.js 
  registration.active.postMessage(
    "Test message sent immediately after creation",
  );
});
```

在 service-worker.js 檔案裡，監聽從主視窗傳來的訊息：

```javascript
// service-worker.js
addEventListener("message", (event) => {
  console.log(`Message received: ${event.data}`);
});
```



### **Client.postMessage**

在 Service worker 中，[client](https://developer.mozilla.org/en-US/docs/Web/API/Client) 是指通過 Service worker 註冊過的頁面，

Client.postMessage 相對於 ServiceWorker**.**postMessage，可以說是反向傳遞訊息，Client.postMessage 從 service worker 檔案中，傳遞訊息到主視窗

以下範例傳遞訊息到所有 **註冊過 service-worker.js 的頁面**，首先呼叫 [Clients.matchAll()](https://developer.mozilla.org/en-US/docs/Web/API/Clients/matchAll) 取得所有註冊過 Service worker 的頁面，接著再分別使用 Client.postMessage 將訊息傳給所有頁面

```javascript
// service-worker.js
self.clients.matchAll().then(function(clients) {
  clients.forEach(function(client) {
    client.postMessage('傳遞到主視窗的訊息');
  });
});
```



### MessagePort: postMessage

請參考第 x 天 的介紹與第 x 天的範例



### BroadcastChannel.postMessage

BroadcastChannel 傳遞訊息的方式我們也在之前有介紹過，請參考 第 x 天



### **總結**

根據不同的場景分別有不同的 postMessage 使用方式，共同點是每一個都使用 structuredClone 的方法複製數據，而是否可以傳遞 Transferable objects 及是否有同源限制則有所差異



<table><thead><tr><th width="300.3333333333333">種類</th><th width="163">structuredClone</th><th>transfer 參數</th><th>同源限制</th></tr></thead><tbody><tr><td>window.postMessage</td><td>O</td><td>O</td><td>X</td></tr><tr><td>Worker.postMessage</td><td>O</td><td>O</td><td>O</td></tr><tr><td>ServiceWorker.postMessage</td><td>O</td><td>O</td><td>O</td></tr><tr><td>Client.postMessage</td><td>O</td><td>O</td><td>O</td></tr><tr><td>MessagePort: postMessage</td><td>O</td><td>O</td><td>X</td></tr><tr><td>BroadcastChannel.postMessage</td><td>O</td><td>X</td><td>O</td></tr></tbody></table>



### Reference

[運用 postMessage 解決 iframe 與父層溝通的問題](https://uu9924079.medium.com/%E9%81%8B%E7%94%A8-postmessage-%E8%A7%A3%E6%B1%BA-iframe-%E8%88%87%E7%88%B6%E5%B1%A4%E6%BA%9D%E9%80%9A%E7%9A%84%E5%95%8F%E9%A1%8C-3b7e5d05d10)

[postMessage：主頁、iframe 頁可互相傳值](https://www.letswrite.tw/postmessage/?source=post\_page-----3b7e5d05d10--------------------------------)

[postMessage可太有用了](https://juejin.cn/post/6844903665694687240)

[如何与 Service Worker 通信](https://segmentfault.com/a/1190000022240909)
