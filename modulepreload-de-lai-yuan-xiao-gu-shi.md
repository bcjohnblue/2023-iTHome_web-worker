# modulepreload 的來源小故事

基本上 modulepreload 的用法就如同上一篇所提的一樣，很像 [preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload) 的用法，但有那麼一點不同，看到這不知道有沒有人好奇，既然如此那為什麼不直接沿用 `<link rel="preload" />` 的用法就好了呢？這也是這篇文 [Preloading modules](https://developer.chrome.com/blog/modulepreload/#ok-so-why-doesnt-link-relpreload-work-for-modules) 所提到的一個想法，提到這部分文章總共分三段，其中比較重點的是前面兩段，以下我就節錄這兩段文章並對這背後的歷史淵源做一個分析：

### OK, so why doesn't `<link rel="preload">` work for modules? <a href="#ok-so-why-doesnt-link-relpreload-work-for-modules" id="ok-so-why-doesnt-link-relpreload-work-for-modules"></a>

> This is where things get tricky. There are several credentials modes for resources, and in order to get a cache hit they must match, otherwise you end up fetching the resource twice. Needless to say, double-fetching is bad, because it wastes the user's bandwidth and makes them wait longer, for no good reason.

這件事本身是有點棘手的，對於資源來說會有數種 **credential mode** 的定義 **，**為了能夠覆用 cache，對於這些資源來說，他們的 **credential mode** 也是必須一致的，如果這些資源的 **credential mode** 不一致，最終你等於載入相同的資源兩次，而這件事很明顯的就是不好的，因為使用者會消耗多餘的網路頻寬、使網頁載入的時間更長，等得更久。



這裡我們先釐清一下什麼是資源，資源轉換成程式上的表達，可以想像成就是 `<srcipt src="..." />`這種寫法，代表著需要花時間載入的外部 script。

而 **credential mode** 是牽涉到 CORS 的一個專有名詞 (建議各位先跳到 **補充小知識 1 - CORS 概念複習，**有助於瞭解接下來的部分)，而第一段的結論大致上可以用以下程式碼來表示：

```html
<link
  rel="preload"
  src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"
  as="script"
/>
<script 
  src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js" 
  crossorigin="use-credentials"
/>
```

這兩個 script 指向的是同一個資源，但在獲取時一個沒有加 **crossorigin**、一個有加 **crossorigin**，而這兩個寫法的 **credential mode** 是不同的 (`same-origin` vs `include`)，如此就有可能導致資源重複獲取兩遍。

一開始我不確定對於這一段的理解是否正確，畢竟以前看到的 HTTP cache 都是在講 `Cache-Control`、`max-age`、`Expires` 等，最有相關聯的大概是 [使用 CORS 與 cache 時的注意事項](https://blog.huli.tw/2021/02/19/cors-guide-4/#%E4%BD%BF%E7%94%A8-cors-%E8%88%87-cache-%E6%99%82%E7%9A%84%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A0%85) 這篇，似乎沒看過 cache 的命中是會被 **credential mode** 影響的，最後是看到這個 [討論](https://bugs.chromium.org/p/chromium/issues/detail?id=740886#c18)，我想應該是這樣理解沒錯，如果不對的話再幫忙告知修正謝謝。



要進入第二段了，我覺得這段是最複雜的，找了很多資料後才理解在說什麼...

> For `<script>` and `<link>` tags, you can set the credentials mode with the `crossorigin` attribute. However, it turns out that a `<script type="module">` with no `crossorigin` attribute indicates a credentials mode of `omit`, which doesn't exist for `<link rel="preload">`. This means that you would have to change the `crossorigin` attribute in both your `<script>` and `<link>` to one of the other values, and you might not have an easy way of doing so if what you're trying to preload is a dependency of other modules.

對於 `<script>`跟 `<link>` 標籤來說，你可以根據 **crossorigin** 設置 **credentials mode。**但是 `<script type="module">` 這種不加 **crossorigin** 的寫法指明了 **credentials mode** 是 `Omit`，而這個值並不存在於 `<link rel="preload">`。這表示你必須同時的去更改 `<script>` 以及 `<link>` 標籤中的 **crossorigin**，但這並不是一件容易做到的事，當你想要 preload 的資源有可能是其他 module 之中的依賴項時。



這裡是我最看不懂的地方，其實目前在 MDN 中完全找不到 `<script type="module">` 的 **crossorigin** 說明，最後是在規範中看到這兩點：

[Unlike classic scripts, module scripts require the use of the CORS protocol for cross-origin fetching.](https://html.spec.whatwg.org/multipage/scripting.html#the-script-element)

[Let module script credentials mode be the CORS settings attribute credentials mode for el's `crossorigin` content attribute.](https://html.spec.whatwg.org/multipage/scripting.html#the-script-element)

再搭配上 **補充小知識 1 - crossorigin**，可以推斷 **目前** `<script type="module">`在不加 **crossorigin** 時預設的 **credentials mode** 是 `same-origin`，那麼為什麼這段直接說預設是 `Omit`呢？原來是在 `<script type="module">` 剛出來時 **credentials mode** 的預設值設成跟 `fetch()` 一樣，都是 `Omit` ([https://github.com/whatwg/html/issues/2557](https://github.com/whatwg/html/issues/2557))，是後來經過一些演進過後才讓 `<script type="module">` 跟 `fetch()`都變回 `same-origin` 的([https://github.com/whatwg/fetch/pull/585](https://github.com/whatwg/fetch/pull/585))。

理解了這段歷史淵源後終於可以看懂了，`<script type="module">` 一開始預設值是 `Omit`，而在 `<link rel="preload">` 標籤中加上 **crossorigin** 設定也無法使其 **credentials mode** 等於 `Omit`，再搭配第一段的說明，這代表在以前一開始的時候 `<script type="module">`跟 `<link rel="preload">` 就是難以搭配讀到快取的，因為前者的 **credentials mode** 預設為 `Omit`，而後者卻沒辦法設定成 `Omit`。

但發展到現在 `<script type="module">` 的 **credentials mode** 預設值已經是 `same-origin` 了，所以事實上可以用 `<link rel="preload" crossorigin>` 的方式加載快取 **module script**，但即使是這樣還是會有些 [缺點產生](https://docs.google.com/document/d/1WebH4IOCswACUbaczx5cGQPVl5mnqcieOd4MRJM2syk/edit#heading=h.j6xue84r515p)，所以最終才誕生了 `<link rel="modulepreload">` 的這個寫法。



### 補充小知識

1. CORS 概念複習

因為這篇文章有些牽涉到 CORS 的專有名詞，如果搞混的話，我覺得很難看得懂這故事的前因後果，所以這邊會先定義以下名詞：

* [crossorigin](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin)

```html
<script 
  src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js" 
  crossorigin
/>
```

當要載入外部資源時，可以設置 **crossorigin** 屬性，這個屬性代表請求的外部資源是否採用 CORS 政策處理，**crossorigin** 的屬性有三種可能，而這三種又會影響到 **request's mode** 跟 **request's credential mode** 的值

* 沒有設置 **crossorigin** 時，也就是完全不寫 **crossorigin** 這個屬性時，**request's mode** 等於 `no-cors`， **request's credential mode** 等於 `same-origin`，這代表此時的請求完全沒有想要使用到 CORS 政策&#x20;

(P.S. 沒有設置 **crossorigin** 時，**request's credential mode** 的值我有點不太確定，MDN 上只有提到不寫 **crossorigin** 時，等同於不使用 CORS 政策。[這一篇文章](https://zhuanlan.zhihu.com/p/345564689) 有寫到沒有設置 **crossorigin** 時，**request's credential mode** 的值為 `include`，但我怎麼看都覺得 [spec](https://html.spec.whatwg.org/multipage/urls-and-fetching.html#cors-settings-attributes) 中的意思是指 **No CORS** 的狀況下，**request's credential mode** 的值會設為 `same-origin`)

* 設置 **crossorigin** 為 ""(空字串)、"**anonymous"** 或是其他的**任意字串，**都視作為定義成 **"anonymous"，**此時 **request's mode** 等於 `cors`，**request's credential mode** 等於 `same-origin`
* 設置 **crossorigin** 為 **"use-credentials"，**此時 **request's mode** 等於 `cors`，**request's credential mode** 等於 `include`\


簡易表格

| crossorigin           | request's mode | request's credential mode |
| --------------------- | -------------- | ------------------------- |
| 無設置                   | `no-cors`      | `same-origin`             |
| **"anonymous"**       | `cors`         | `same-origin`             |
| **"use-credentials"** | `cors`         | `include`                 |

\--------

* [request's mode](https://developer.mozilla.org/en-US/docs/Web/API/Request/mode)

**request's mode** 是進行 api 呼叫 (fetch, XMLHttpRequest) 時，所攜帶的一個參數值，主要用來代表這個請求是不是 **CORS**

```javascript
fetch(url, {
  body: JSON.stringify(data),
  headers: {
    "user-agent": "Mozilla/4.0 MDN Example",
    "content-type": "application/json",
  },
  method: "POST",
  mode: "cors", // here
})
```

**request's mode** 總共有五個可能的值，`same-origin`、`no-cors`、`cors`、`navigate`、`websocket`，這裡根據以上 **crossorigin** 設置的結果，我們只關心 `no-cors`跟 `cors`

*   `no-cors`

    簡單來說這代表的是發出的請求並不牽涉到 CORS 政策，但實際上根據你打的 api 是否同源或不同源可能會有令人意外的結果，請參照 [把 fetch mode 設成 no-cors](https://blog.huli.tw/2021/02/19/cors-guide-2/#%E8%A7%A3%E6%B3%95%E4%BA%8C%E6%8A%8A-fetch-mode-%E8%A8%AD%E6%88%90-no-cors)、[Fetch 的使用注意事項](https://ithelp.ithome.com.tw/articles/10249967)
*   `cors`

    顧名思義，這代表著這個請求是跨域請求，所以一切的規則都要符合 CORS 政策

\-------

* [request's credential mode](https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials)

**request's credential mode** 也是在呼叫 api 時，所攜帶的一個參數值，代表在進行跨域請求時，是否要送出或是接收 cookie 等這種憑證訊息

```javascript
fetch(url, {
  body: JSON.stringify(data),
  headers: {
    "user-agent": "Mozilla/4.0 MDN Example",
    "content-type": "application/json",
  },
  method: "POST",
  credentials: "same-origin", // here
})
```

**request's credential mode** 有三種可能的值，`omit`、`same-origin`、`include`

*   `omit`

    在任何狀況下都不要發送、接收 cookie
*   `same-origin`

    **預設值**。在請求網域同源的狀況下可以發送、接收 cookie，但在不同源的狀況下則不發送、接收 cookie
*   `include`

    在任何狀況下都發送、接收 cookie，代表即使不同源的網域，也會將 cookie 資訊送出去



**尚未解決的小疑問**

1. 在研究的過程中發現了一個叫做 [create a potential-CORS request](https://html.spec.whatwg.org/multipage/urls-and-fetching.html#create-a-potential-cors-request) 的東西，看起來是在要執行 `fetch()` 時，去決定 **request's mode, request's credential mode** 值的步驟，但這部分說實在的我還是沒看懂，如果有了解的大大再請幫忙回答謝謝。

#### Reference

[跨源相关机制综述（三）：crossorigin](https://zhuanlan.zhihu.com/p/345564689)

研究的過程中一直看不懂，還好找到這篇完整提到過去的歷史淵源，幫助我能夠理解寫出這篇文章



[ECMAScript modules in browsers](https://jakearchibald.com/2017/es-modules-in-browsers/#always-cors)

這篇提到很多關於 module script 在瀏覽器中的行為，也講到 module script 預設就是遵守 CORS 的
