# Transferable objects - Stream

**Stream** 對於前端來說應該是個比較陌生的概念，畢竟現在大部分的資料格式最常見的就是 json，那麽 Stream 到底是什麼呢？事實上我們每次對後端呼叫 api 取得資料的時候，大家一定都有碰觸過他，但卻不會實際操作它，因為我們大部分都是把原生的 Stream 轉成了 json 格式來做使用。以下我們就從最常看見的 fetch api 來了解吧。



我最近睡覺都會玩 pokemon sleep 蒐集跟我一起睡覺的神奇寶貝，所以讓我從獲得神奇寶貝資訊這裡開始當做範例，介紹 **Stream** 在其中所扮演的角色，以下呼叫 [pokemon api](https://pokeapi.co/) 取得百變怪的相關資料：

```javascript
const response = await fetch('https://pokeapi.co/api/v2/pokemon/ditto');
const result = await response.json();
console.log(result);
```

從 `result` 裡我們可以拿到百變怪的能力、名稱、屬性、種類等等的資訊，而這些資訊都是以 json 格式來呈現的，我們可以看到在拿到 `Response` 後還額外執行了 `await res.json()`，將其轉換成 json 格式，但除了 json 格式外，fetch 實際上也支援了[許多其他的轉換方式](https://developer.mozilla.org/en-US/docs/Web/API/Response#instance\_methods) (`res.arrayBuffer(), res.blob(), res.formData(), res.text()`)，藉由這些轉換函式可以讓原先的 `Response` 轉換成各樣的數據類型，那麽問題來了，`Response` 本身是什麼類型呢？沒錯！他就是今天這一節要討論的主角 Stream。

**Stream 的起源**

網路上有許多的圖片、文件、影音都是可以任由大家下載觀看的，但在久遠的 Javascript 時代，如果你想要下載一個很大的文件或影片，必須要等到瀏覽器將整個檔案下載下來，再經由反序列化(deserialize)轉換成需要的格式，而這樣會造成一些麻煩的問題，例如：

1. 要等待整個檔案下載完才能進行操作，如果是在線上要看影片的話，要等整部影片都載完才能開始觀看，使用者完全不可能接受
2. 如果在網路下載的過程中，網路不穩斷線了，整個檔案都需要重新下載

所以後來才出現了 **Stream** 的概念，可以將網路下載來的檔案分成一段一段處理，而不是像以往的一整塊綁在一起，而由於整個檔案都切分成很多的一小段，**Stream** 也可以做到控制什麼時候開始或取消檔案下載，以及網路中斷後支援斷點續傳的功能。

**Stream 的傳遞過程**

<figure><img src="https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Concepts/readable_streams.png" alt=""><figcaption></figcaption></figure>

在 Stream 傳遞的過程中，有一個重要的概念叫做 chunk，我們知道 Stream 可能是一個很大的檔案，那麽分批處理這個檔案的單位我們就叫做 chunk (圖中的三角形 data)，每個 chunk 會被**排入隊列(enqueued)**，等待被上圖中間的 consumer 操作，其中一個 consumer 為 **Reader**，下面在講解 **ReadableStream** 時會提到，而在 consumer 操作的過程中，整個 Stream 會被**鎖住(lock)**，以防止其他 consumer 操作資料造成不同步的問題，最後 consumer 可能會將 Stream 轉為不同的資料型態然後往上圖的右邊繼續傳遞下去。

**Stream 的種類**

**Stream** 根據讀寫的狀況還分成幾種，這裡我們先介紹常見的三種

*   **ReadableStream**

    可以被讀取的 Stream，上面提到 fecth api 回傳的 Response 就是這一種
*   **WritableStream**

    用來寫入的 Stream
*   **TransformStream**

    可以讀取又可以寫入的 Stream，主要是作為一個中間流轉換資料



**ReadableStream**

**讀取 Stream**

首先執行 [getReader](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream/getReader) 會創建出一個可讀的 reader

```javascript
const reader = response.body.getReader();
```

接著我們會循環的呼叫 `reader.read()` ，依序的將 Stream 裡的數據讀取出來，`reader.read()` 會回傳兩個參數，其中 `value` 是 **Uint8Array** 型別，代表這次讀取所得到的 Stream 片段，而 `done` 則代表著 Stream 是否全部讀取完畢。

```javascript
while (true) {
  const {value, done} = await reader.read();
  if (done) break;
  console.log('Received', value);
}

console.log('Response fully received');
```

**讀取 Stream 為 ArrayBuffer**

結合以上的方法，我們可以實作一個簡單的 `toBuffer` 函式將百變怪的資訊以 **Uint8Array** 的結果讀取出來：

```javascript
const res = await fetch('https://pokeapi.co/api/v2/pokemon/ditto');
const reader = body.getReader();
const buffer = await toBuffer(reader);
console.log('Received buffer data', buffer); // [Uint8Array(23286)]

async function toBuffer(reader) {
  const chunk = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    chunk.push(value);
  }

  return chunk;
}
```

**讀取 Stream 為 JSON**

但在這個獲取寶可夢的例子上，我們需要的資料格式不是 **ArrayBuffer** 而是 **JSON**，所以接著讓我們來看看要怎麼把 **Stream** 轉換成 **JSON** 格式，首先要將 **Stream** 轉換為文本格式的話，我們需要用到的是另一個 web api - [TextDecoder](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder) (**補充小知識 1.**)，利用 TextDecoder 我們可以很輕鬆的將 Stream 轉換成想要的文本格式

```javascript
const res = await fetch('https://pokeapi.co/api/v2/pokemon/ditto');
const reader = body.getReader();
const json = await toJSON(reader);
console.log('Received json data', json);

async function toJSON(reader) {
  const decoder = new TextDecoder();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const chunk = decoder.decode(value, { stream: true });
    chunks.push(chunk);
  }

  return JSON.parse(chunks.join(''));
}
```

**WritableStream**

**建構 WritableStream**

我們可以實例化建立一個 **WritableStream** (實際上 **ReadableStream** 也可以，但避免太過複雜上面只舉了一個簡單的寶可夢範例說明)，而在裡面的第一個參數可以定義這個 Stream 在不同生命週期所執行的函式：

1.  **start(controller)**

    在 **WritableStream** 被建立時只會執行一次，主要可以拿來處理初始化需要的邏輯
2.  **write(chunk,controller)**

    當有新的 chunk 進來時就會被呼叫，所以在寫入的過程中，這個函式會一直被多次執行
3.  **close(controller)**

    當沒有新的 chunk 進來時，代表整個寫入階段結束時執行
4.  **abort(reason)**

    當在寫入途中發生任何問題時執行，類似 error handling 機制

```javascript
const stream = new WritableStream(
  {
    start(controller) {},
    write(chunk, controller) {},
    close(controller) {},
    abort(reason) {},
  },
);
```

接下來讓我們利用 MDN 中的 [Simple writer example](https://mdn.github.io/dom-examples/streams/simple-writer/) 範例，稍微了解一下 **WritableStream** 的使用方式，在這個例子中展示的是將 **"Hello, world"** 這段文字先編碼成 **ArrayBuffer** 丟進 **WritableStream** 中寫入，接著再從 **write(chunk, controller)** 中將各個字母解碼回來並顯示在畫面上。

<figure><img src=".gitbook/assets/截圖 2023-09-13 上午12.44.19.png" alt=""><figcaption><p>MDN demo</p></figcaption></figure>

首先會先建立 **WritableStream** 並在每次接受到 chunk 寫入時，將原本的 ArrayBuffer 解碼後獲取每個單字字母並渲染到畫面

```javascript
const writableStream = new WritableStream(
  {
    write(chunk) {
      return new Promise((resolve, reject) => {
        const buffer = new ArrayBuffer(1);
        const view = new Uint8Array(buffer);
        view[0] = chunk;
        
        // 將 ArrayBuffer 解碼回英文字母
        const decoder = new TextDecoder();
        const decoded = decoder.decode(view, { stream: true });
        
        // 準備將字母渲染回畫面上
        const listItem = document.createElement("li");
        listItem.textContent = `Chunk decoded: ${decoded}`;
        list.appendChild(listItem);
        result += decoded;
        resolve();
      });
    },
  },
);
```

然後執行 `sendMessage` 函式，主要是把原本的整個句子編碼成 ArrayBuffer 後寫入到 **WritableStream** 裡

```javascript
sendMessage("Hello, world.", writableStream);
function sendMessage(message, writableStream) {
  const defaultWriter = writableStream.getWriter();
  
  // 把原本的整個句子編碼成 ArrayBuffer
  const encoder = new TextEncoder();
  const encoded = encoder.encode(message, { stream: true });
  
  // 將編碼後的 ArrayBuffer 寫入 WritableStream
  encoded.forEach((chunk) => {
    defaultWriter.ready
      .then(() => defaultWriter.write(chunk))
      .then(() => console.log("Chunk written to sink."))
      .catch((err) => console.error("Chunk error:", err));
  });
  
  // 再度呼叫 .ready 以保證在關閉 Stream 前，所有的 chunks 都被寫入
  defaultWriter.ready
    .then(() => defaultWriter.close())
    .then(() => console.log("All chunks written"))
    .catch((err) => console.error("Stream error:", err));
}

```

這裡需要特別注意的是，在寫入 Stream 前都需要執行 [ready](https://developer.mozilla.org/en-US/docs/Web/API/WritableStreamDefaultWriter/ready)，以保證目前的 **WritableStream** 的狀態是可以接受下一個 chunk 傳入進來的

```javascript
defaultWriter.ready.then(() => ...)
```

以上範例擷取了大概的流程以讓大家了解 **WritableStream** 的使用方式，但其實在建構 **new WritableStream** 時還可以傳入第二個參數，第二個參數中有 highWaterMark, size 等設定值，這部分牽涉到的是 [Backpressure](https://developer.mozilla.org/en-US/docs/Web/API/Streams\_API/Concepts#backpressure) 的觀念，但因為較為深入就不在我們今天的討論範圍，對於這個範例， 完整的程式碼請參照 [How writable streams work](https://developer.mozilla.org/en-US/docs/Web/API/Streams\_API/Using\_writable\_streams#how\_writable\_streams\_work)

```javascript
const stream = new WritableStream(
  {
    start(controller) {},
    write(chunk, controller) {},
    close(controller) {},
    abort(reason) {},
  },
  {
    highWaterMark: 3,
    size: () => 1,
  },
);
```

**TransformStream**

身為可以讀取也可以寫入的 **TransformStream**，類似中介者的腳色常用來進行不同的資料轉換，最常搭配 pipeThrough() 及 pipeTo() 一起使用，丟入 pipeThrough() 中的參數就是 **TransformStream**，可以將資料轉換過後再丟到下一個步驟進行處理，基本上就是 redux 或是 express 的 middleware 概念，而最後要將處理過的資料寫入則是會利用 pipeTo() 函式，下面讓我們用兩個例子比較好理解 **TransformStream** 的用法。

<figure><img src="https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Concepts/pipechain.png" alt=""><figcaption><p><a href="https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Concepts#pipe_chains">Pipe chains</a></p></figcaption></figure>

還記得上面的 **ReadableStream** 我們獲取寶可夢的資料時寫了一個 toJSON 的函式將 **Stream 轉為 JSON 嗎？**這一段邏輯可以改用 web 內置的 [TextDecoderStream](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoderStream) 讓程式碼更容易被覆用，這裡我們使用 pipeThrough 加上 TextDecoderStream，將原本自己寫的**解碼(TextDecoder)邏輯**改為讓**TextDecoderStream** 這個 **TransformStream** 去做處理，讓整個架構職責的區分更為清楚

```javascript
const response = await fetch(url);
// 讓 TextDecoderStream 處理解碼(TextDecoder)
const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
const rawJson = await toBuffer(reader);
const json = JSON.parse(rawJson.join(''));

async function toBuffer(reader) {
  const chunk = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    chunk.push(value);
  }

  return chunk;
}
```

第二個例子是建立一個 **TransformStream** 實例，使用他能讀又能寫的功用，將資料流壓縮成 gzip，再回寫到 **TransformStream** 的 writable 裡，達到使用一個 **TransformStream** 就將原本的 Stream 轉換成我們想要的格式

```javascript
// Get from url1:
const response = await fetch(url1);
const {readable, writable} = new TransformStream();

// Compress the data from url1:
response.body.pipeThrough(new CompressionStream('gzip')).pipeTo(writable);

// Post to url2:
await fetch(url2, {
  method: 'POST',
  body: readable,
});
```

**在 web worker 中使用 Stream**

回到一開始，**Stream** 是一種 **Transferable objects**，這代表在處理影音或是串流這種相對檔案較大的媒體格式時，可以考慮把 **Stream** 轉移到 worker 中做一些邏輯上的處理，最後再將想要的結果轉回主線程，讓這種資料處理的過程不會影響到主線程的運行。

**結論**

以上大概就是 ReadableStream, WritableStream, TransformStream 的一些基本介紹了，中間略過了很多較為複雜的概念，像是 stream lock, backpressure 等等，但以上的範例我想足夠讓大家快速理解 Stream 的各種基本用法了。



**補充小知識**

1.  [TextDecoder](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder)

    用來處理文字相關的**編碼(TextEncoder)**與**解碼(TextDecoder)**，包括常見的 utf-8、utf-16、big-5 等等，constructer 中可以傳入編碼格式，不傳的話預設為 utf-8，以下例子分別使用 encode、decode 兩個方法進行 utf-8 的編解碼轉換。

```javascript
const encoder = new TextEncoder();
const array = encoder.encode("€"); // Uint8Array(3) [226, 130, 172]

const decoder = new TextDecoder();
const str = decoder.decode(array); // String "€"
```

2. **body stream already read**

<figure><img src=".gitbook/assets/截圖 2023-09-13 上午2.07.58.png" alt=""><figcaption></figcaption></figure>

有時候我們在 debug api 的回傳結果時，可能會看到這個錯誤，原因就是你可能呼叫了兩次 `res.json()`，我們現在知道 res.body 實際上是一個 Stream，[而 Stream 是不能被操作兩次](https://developer.mozilla.org/en-US/docs/Web/API/Streams\_API/Concepts#teeing)，所以才會出現這個錯誤訊息。



**Reference**

[Streams API concepts](https://developer.mozilla.org/en-US/docs/Web/API/Streams\_API/Concepts)

[Streaming requests with the fetch API](https://developer.chrome.com/articles/fetch-streaming-requests/)

[从 Fetch 到 Streams —— 以流的角度处理网络请求](https://zhuanlan.zhihu.com/p/98848420)

[How to Convert JavaScript ReadableStream Object to JSON?](https://www.designcise.com/web/tutorial/how-to-convert-javascript-readablestream-object-to-json)

[Using writable streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams\_API/Using\_writable\_streams)
