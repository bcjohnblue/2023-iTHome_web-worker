# Transferable objects - MessagePort (Channel messaging)

**MessagePort** 是 HTML 中 [Channel Messaging API](https://developer.mozilla.org/en-US/docs/Web/API/Channel\_Messaging\_API) 的接口，主要用途就是拿來進行雙向溝通傳遞，有點類似 [addEventListener](https://developer.mozilla.org/zh-TW/docs/Web/API/EventTarget/addEventListener), [vue2 的 EventBus  ](https://medium.com/itsems-frontend/vue-event-bus-15b76f27aeb9)這種發布訂閱模式，使用方式如下：

```javascript
const channel = new MessageChannel();
const port1 = channel.port1; // MessagePort 接口
const port2 = channel.port2; // MessagePort 接口
```

創建的實例 `channel` 會有兩個屬性，`port1` 跟 `port2`，有點像是我們小時候玩的傳聲筒(可以用養樂多罐中間串著一條線)，兩側的養樂多罐都可以傳送聲音到另一側或是從另一側接收到聲音，接著就可以使用 `postMessage` 及 `onmessage` 傳送、接收訊息：

```javascript
// port1 發送訊息，port2 接收訊息
port2.onmessage = (e) => {
  console.log('從 port1 傳來的訊息', e.data) // 顯示 port1
};
port1.postMessage('port1');

// 或是反過來由 port2 傳送訊息，port1 接收訊息
port1.onmessage = (e) => {
  console.log('從 port2 傳來的訊息', e.data) // 顯示 port2
};
port2.postMessage('port2');
```

而 **Channel messaging** 常拿來使用的場景是與 iframe 之間的溝通，假設有一個社交網站開發了一個遊戲，而這個遊戲是額外用一個 iframe 去執行的，當使用者玩完這個遊戲的時候，通常會設計一個最高分機制，可以將這個分數從 iframe 傳遞到原本網站的主頁面，如此一來就可以使用 **Channel messaging** 來進行資料的傳遞或互動。

接著拿 MDN 的[官方範例](https://developer.mozilla.org/en-US/docs/Web/API/Channel\_Messaging\_API/Using\_channel\_messaging#simple\_examples)來解釋：

以下 [demo](https://mdn.github.io/dom-examples/channel-messaging-multimessage/) 展示了一個主頁面與 iframe 之間的訊息傳遞過程：

1. 主頁面會將使用者輸入的訊息傳遞給 iframe
2. iframe 接收到訊息後，用列表的方式顯示出來
3. 接著 iframe 又會將剛接收到的訊息傳回給主頁面
4. 最後主頁面接到從 iframe 傳來的訊息後，會在最上面顯示出來

<figure><img src="https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API/Using_channel_messaging/channel-messaging-demo.png" alt=""><figcaption><p>範例 From MDN</p></figcaption></figure>

**index.html (主頁面)**

```html
<body>
  <iframe src="page2.html" width="480" height="320"></iframe>
  <script>
    const iframe = document.querySelector("iframe");
    const channel = new MessageChannel();
    const port1 = channel.port1; // port1 代表主頁面的溝通埠

    iframe.addEventListener("load", onLoad);

    function onLoad() {
      button.addEventListener("click", onClick);
      port1.onmessage = onMessage;
      // Step 0. 
      // 最一開始先將 port2 傳遞給 iframe，使 iframe 可以藉由 port2 發送接收訊息
      iframe.contentWindow.postMessage("init", "*", [channel.port2]);
    }

    // Step 1. 使用者按下送出後，將輸入的值從 port1 送出
    function onClick(e) {
      e.preventDefault();
      port1.postMessage(input.value);
    }

    // Step 4. 主頁面接收到 iframe 傳來的訊息後，顯示在畫面上
    function onMessage(e) {
      output.innerHTML = e.data;
      input.value = "";
    }
  </script>
</body>
```

**page2.html (iframe)**

```html
<body>
  <ul></ul>
  <script>
    const list = document.querySelector("ul");
    let port2;

    // 初次接收到訊息，初始化設定 port2
    window.addEventListener("message", initPort);

    function initPort(e) {
      port2 = e.ports[0];
      // 設定完 port2 後，可以監聽 port1 傳來的訊息
      port2.onmessage = onMessage;
    }

    // Step 2. 接收到主頁面傳來的訊息後，渲染到 iframe 裡的列表上
    function onMessage(e) {
      const listItem = document.createElement("li");
      listItem.textContent = e.data;
      list.appendChild(listItem);
      // Step 3. 接著再把接收到的訊息回傳給主頁面
      port2.postMessage('Message received by IFrame: "' + e.data + '"');
    }
  </script>
</body>
```

其中 `iframe.contentWindow.postMessage` 用來在一開始時將 port2 傳遞給 iframe，使得之後的 iframe 可以操作 **port2** 來發送、接收訊息

1. 第一個參數 **"init"**，是傳送給 iframe 的訊息，單純讓 iframe 知道這是第一次的初始化
2. 第二個參數 **"\*"** ，代表這個訊息可以傳遞給任意來源網址的 iframe
3. 第三個參數 **"\[channel.port2]"**，代表著要把 **port2** 的使用權轉移到 iframe

```javascript
iframe.contentWindow.postMessage("init", "*", [channel.port2]);
```



以上的範例介紹了 **Channel messaging** 的使用方式，但其實我們今天都還沒講到 **MessagePort** 身為 **Transferable objects** 的作用，這一點我們明天再來看 **MessagePort** 是怎麼應用在 web worker 裡的。

**Reference**

[MDN - Using channel messaging](https://developer.mozilla.org/en-US/docs/Web/API/Channel\_Messaging\_API/Using\_channel\_messaging)
