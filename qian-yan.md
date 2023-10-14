# 前言

最近工作上有一些影像處理的需求，需要將 2D 的圖片做一些影像處理，最後是要做到讓圖片類似模糊的效果，而使用者可以藉由 slider 調整模糊的比例，從 0\~100%，數值越大的話圖片就會越模糊，畫面上大概像下面這樣：

<figure><img src=".gitbook/assets/截圖 2023-09-15 下午3.22.22.png" alt=""><figcaption><p>根據拖拉的數值改變模糊比例，圖片來源：<a href="https://codepen.io/ElJefe/pen/XJdpEP">https://codepen.io/ElJefe/pen/XJdpEP</a></p></figcaption></figure>

為了實作這個功能，我就按照資深同事的建議在前端引入了 [opencv.js](https://hi-upchen.medium.com/%E5%A6%82%E4%BD%95%E5%9C%A8-nodejs-%E6%88%96%E5%89%8D%E7%AB%AF%E4%BD%BF%E7%94%A8-opencv-%E5%85%8D%E5%AE%89%E8%A3%9D-cc2fea289054) 並把圖片模糊化，有點像是 [這一篇](https://shengyu7697.github.io/python-opencv-gaussianblur/) 實作的方式，很順利的，圖片模糊的效果看起來很好，但在使用者拖動 slider 的時候問題產生了，看起來是 opencv 對圖像模糊的運算量很大，所以每次運算都會耗費 100\~200ms 左右的時間，結果就是拖動 slider 的時候畫面都會有很明顯的卡頓，甚至感覺根本拖不動...

<figure><img src=".gitbook/assets/截圖 2023-09-15 下午3.32.15.png" alt=""><figcaption><p>使用 opencv.js 執行運算的時間</p></figcaption></figure>

這時候我就想到了，這不就是 Web worker 派上用場的時候了嗎？Web worker 可以利用獨立的線程運算，不會佔用到主線程的資源，這也就代表畫面卡頓的問題可以解決了。所以接著一兩天我就在網路上找了各種相關的資料，後來發現，哇，介紹 Web worker 相關的中文資料怎麼那麼少啊，目前大部分的文章似乎都只介紹 Web worker 的基本用法，但在這幾天找資料的過程中，我發現應該還有很多可以深入研究的部分。而這個月也剛好是大名鼎鼎的鐵人賽期間，我就想說不如邊學習邊分享吧，雖然能準備的時間所剩不多，但剛好也強迫自已去學習 Web worker 並分享出來。

**目的**

一開始的時候我覺得 Web worker 這方面能分享的東西似乎講不到 30 天，但，都已經看了一些東西，準備好了前幾天要寫的素材，所以頭就直接洗下去吧，就算最後寫不到 30 天，這中間學習的過程應該也是充實的。

接下來的系列文中，我希望能達到以下兩個目的，寫到最後一天的總結後，再來看看自己有沒有達到目標吧。

* 完整介紹 Web worker 知識，希望讓之後需要相關資料的人，有完整的範例介紹，可以快速的理解
* 希望理解 Web worker 的用法後，對 WebGL、Three.js 這些我有興趣的網頁 3D 渲染技術可以有所幫助、相輔相成
