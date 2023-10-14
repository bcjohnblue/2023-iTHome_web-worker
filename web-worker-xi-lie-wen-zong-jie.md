# Web worker 系列文 - 總結

一開始我們從最常使用的 **web worker** - [Dedicated worker](https://ithelp.ithome.com.tw/articles/10320823) 開始，接著介紹使用 `postMessage` 在主線程與 **worker** 線程間傳遞資料，並說明 `postMessage` 傳遞資料的方式是使用類似深複製的 [structuredClone 算法](https://ithelp.ithome.com.tw/articles/10322798)，因此當資料量很大時，資料在不同線程間的傳遞就會非常耗時，請參考 - [postMessage 速度測試](https://ithelp.ithome.com.tw/articles/10323691)。

由於資料量太大會有以上的耗時問題，所以第 7 天介紹了 [Transferable Objects](https://ithelp.ithome.com.tw/articles/10324541)，`Transferable Objects` 可以在資料傳遞的時候，將資料的所有權 **轉移(transfer)** 到 **worker** 線程，因為省略了深複製的過程，所以資料的傳遞速度將可以大幅的變快，請參考 - [測試 Transferable objects 效能](https://ithelp.ithome.com.tw/articles/10324541)。

接著從第 8 天開始介紹了各種的 `Transferable Objects` 以及他們各自的用法，包括了 [ArrayBuffer](https://ithelp.ithome.com.tw/articles/10325251), [MessagePort](https://ithelp.ithome.com.tw/articles/10326890), [Stream](https://ithelp.ithome.com.tw/articles/10328921), [ImageBitMap](https://ithelp.ithome.com.tw/articles/10329544), [OffscreenCanvas](https://ithelp.ithome.com.tw/articles/10331669) 等。

第 18 天介紹了另一種的 **web worker** - [Shared worker](https://ithelp.ithome.com.tw/articles/10333041)，不同於 `Dedicated worker` 只能被創建當下的主線程使用，`Shared worker` 只要是同源的頁面都可以互相溝通傳遞資料，因此也會有所謂的 [Shared worker 生命週期](https://ithelp.ithome.com.tw/articles/10333720)。

第 20 天介紹了 [在 Javascript 共享記憶體的方式 - SharedArrayBuffer](https://ithelp.ithome.com.tw/articles/10334292)，`SharedArrayBuffer` 在不同線程中傳遞時，實際上傳遞的就是記憶體位址，這種方式避免了一開始提到使用 `postMessage` 傳遞資料到其他線程時執行的 **structuredClone** 與 **處理轉移(transfer)** 的運算開銷，所以可以做到高效能的平行運算。但各線程可以同時操作記憶體的行為也使得資料同步的問題需要被解決，所以第 21 天介紹了如何使用 [Atomic](https://ithelp.ithome.com.tw/articles/10334458) 避免多線程操作同一筆資料時造成的 **競爭危害 race condition** 問題

第 22 天介紹了輕量級的 **web worker** - [AudioWorklet](https://ithelp.ithome.com.tw/articles/10335110)，藉由範例的講解看到了如何使用 AudioWorklet 在 **web worker** 中播放處理音訊。

第 24 天介紹 [網頁中各種 postMessage 的使用方式](https://ithelp.ithome.com.tw/articles/10335698)，由於在前幾天的文章中，我們學習到不同地方使用 `postMessage` 的場景都不盡相同，所以寫了一篇文章做了整體的比較。

第 25、26 天，我們介紹了使用 [modulepreload](https://ithelp.ithome.com.tw/articles/10336841) 優化 [module worker](https://ithelp.ithome.com.tw/articles/10321787) 的載入，使用 `modulepreload` 類似於使用 [preload](https://ithelp.ithome.com.tw/articles/10336841) 的方式，明確告知瀏覽器哪些資料是重要的，使得瀏覽器可以提前下載這些關鍵資源。

第 27、28 天，我們介紹了兩種 web worker 相關的套件 - [comlink](https://ithelp.ithome.com.tw/articles/10337926) 以及 [workerpool](https://ithelp.ithome.com.tw/articles/10338422)，使用 `comlink` 可以對 **web worker** 進行一層封裝，使得程式碼寫得更簡潔，而 `workerpool` 則是可以創建多個 `web worker` 線程，加快整體運算的速度。

第 29 天，回歸到一開始的初衷，介紹了 [如何在 web worker 中使用 opencv.js](https://ithelp.ithome.com.tw/articles/10339140)，**opencv.js** 是一個強大的圖像處理庫，但也因此在網頁中使用更容易遇到效能問題，在這篇文章中我們藉由範例看到如何使用 **web worker** 搭配 **opencv.js** 的使用，優化使用者體驗。

### 心得

一開始其實完全不覺得 **web worker** 這個主題可以寫到 30 天的文章，本來想說寫不滿就算了，還好中間研究到了 `Transferable Objects`，讓我多出了許多素材可以生出文章。而且原本覺得 **web worker** 相關的知識應該不多，但接觸到後發現額外要了解的東西多出好多，像是第 20 天的 `SharedArrayBuffer`，延伸又要了解一些 **COOP、COEP** 等網頁的安全性設定，還有第 26 天 `modulepreload` 的小故事，一開始只是讀到一篇文章好奇為什麼不用 `preload` 就好，結果延伸出一堆 crossOrigin、CORS 的東西得要深入瞭解，不知道是不是因為 **web worker** 算是比較前沿的網頁技術，感覺研究的過程中不時蹦出一堆額外要自我補充了解的東西。

30 天的過程真的是蠻漫長的，首先一開始每天為了要寫完文章，都要比平常晚個兩三個小時睡覺才行，一開始真的蠻痛苦的，久而久之現在反而要到凌晨一兩點時才習慣睡覺了。寫文章也是一樣，一開始真的想了半天都不知道該怎麼開頭，現在回頭看也發現頭幾天的文章架構實在有點亂。

而且我覺得當人有一定的時間限制時，就會逼迫自己去完成某種目標，像是想要完整寫完這 **web worker** 相關的知識，如果沒有參加這個 30 天挑戰的話，我大概還是繼續耍廢中。而且有目標後感覺學習的速度也變快了，30 天的過程真的是過得很充實，但也真的夠累，想想這麼充實的感覺好像只有在自己剛轉職當前端工程師時才有的感覺，哈哈。

