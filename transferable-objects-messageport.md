# Transferable objects - MessagePort

昨天學習了 Channel messaging 在主頁面與 iframe 之間的訊息傳遞方式，而今天就讓我們來看看 MessagePort 怎麼在 web worker 中發揮 Transferable object 的作用吧。

以下範例創建兩個 worker，並且將 **MessageChannel** 中產生的兩個 port 分別轉移到這兩個 worker，做到兩個 worker 之間的互相通信。

**index.mjs (主線程)**

```javascript
// 首先我們創建兩個 worker
const worker1 = new Worker('public/worker1.mjs');
const worker2 = new Worker('public/worker2.mjs');

// 接著將 MessagePorts 分別轉移到 worker 1 & 2
const channel = new MessageChannel();
worker1.postMessage('INIT', [channel.port1]);
worker2.postMessage('INIT', [channel.port2]);
```

**worker1.mjs**

```javascript
let port1;

const init = (port) => {
  port1 = port;
  port1.onmessage = (e) => {
    console.log('worker1 中的 port1 接收到的資料', e.data);
  };
};

const sendMessage = (data) => {
  console.log('worker1 接收到的資料', data);
  port1.postMessage(data); // 這裡將資料直接傳遞到 port2 (也就是 worker2)
};

self.onmessage = (e) => {
  const port = e.ports[0];

  switch (e.data) {
    case 'INIT':
      init(port);
      break;
    default:
      sendMessage(e.data);
      break;
  }
};
```

**worker2.mjs**

```javascript
let port2;

const init = (port) => {
  port2 = port;
  port2.onmessage = (e) => {
    console.log('worker2 中的 port2 接收到的資料', e.data);
  };
};

const sendMessage = (data) => {
  console.log('worker2 接收到的資料', data);
  port2.postMessage(data); // 這裡將資料直接傳遞到 port1 (也就是 worker1)
};

self.onmessage = (e) => {
  const port = e.ports[0];

  switch (e.data) {
    case 'INIT':
      init(port);
      break;
    default:
      sendMessage(e.data);
      break;
  }
};
```

在以上的[簡單範例](https://codesandbox.io/s/messageport-in-web-worker-jgqvhn?file=/index.html)中，我們將創建的 **MessageChannel** 創建出來的 port1 及 port2 分別轉移到 worker1 跟 worker2 中使用，達到讓 worker 1 跟 worker 2 可以直接溝通，這種方式有點像是平常在 vue 或 react 寫 component 時，讓兄弟組件 (sibling element) 溝通的方式，在這裡我們利用了**MessageChannel** 這種雙向溝通的管道使兩個 worker 之間可以直接傳遞消息。



**Reference**

[MessageEvent: ports property](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent/ports)
