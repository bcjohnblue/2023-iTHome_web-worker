# Javascript 中的原子操作 - Atomic

昨天介紹了 SharedArrayBuffer 的功能，使用 SharedArrayBuffer 可以在不同的線程中共享記憶體，達到高效的運算功能，但隨之而來的缺點就是不同線程間操作同一記憶體帶來的 [競爭衝突 (race condition)](https://zh.wikipedia.org/zh-tw/%E7%AB%B6%E7%88%AD%E5%8D%B1%E5%AE%B3)

**Race condition**

假設有兩個線程各自都會將同一個變數 +1，在理想的狀態下，他們會這樣執行，最後的變數值為 2

<figure><img src=".gitbook/assets/截圖 2023-09-29 上午10.10.25.png" alt=""><figcaption></figcaption></figure>

但如果他們在執行的時間上交錯時，可能會發生以下狀況，最後導致變數的值為 1

<figure><img src=".gitbook/assets/截圖 2023-09-29 上午10.10.57.png" alt=""><figcaption></figcaption></figure>



### 什麼是 Atomic?

而在 Javascript 中為了解決 race condition 的狀況，所需使用到的就是 [atomic](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/Atomics)，使用 atomic 基本上代表每一次操作都是單一原子化，無法分割的，什麼是無法分割的意思呢？以上述例子來看，指的就是線程1 執行時的讀取、增加、寫回，三個步驟是會綁在一起執行的，而不會出現以上線程1與線程2執行交錯的狀況

### 使用 Atomic

Atomic 底下提供了數個[靜態方法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/Atomics#static\_methods)，這裡我們先只介紹以下範例會用到的 [Atomics.add()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/Atomics/add) 及 [Atomics.load()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/Atomics/load)，使用這兩個方法分別可以原子操作的方式更改值及讀取值，

```javascript
// Create a SharedArrayBuffer with a size in bytes
const buffer = new SharedArrayBuffer(16);
const uint8 = new Uint8Array(buffer);
uint8[0] = 7;

// 7 + 2 = 9
console.log(Atomics.add(uint8, 0, 2));
// Expected output: 7

console.log(Atomics.load(uint8, 0));
// Expected output: 9
```

另外這些原子操作的方法，第一個參數傳入的都是 TypeArray 型別，上述使用的是 Uint8Array

### 範例

**目的**

1. 藉由範例展示單獨使用 SharedArrayBuffer 時可能發生的 race condition 狀況
2. 使用 Atomic 原子操作避免不同線程間造成的 race condition

**說明**

1. 範例會使用兩個線程同時操作 SharedArrayBuffer 中創建的同一塊記憶體
2. 兩個線程中分別會運行一定次數 (ex. 1000 次)，而每次中都會將原本記憶體中的數值 +1
3. 最後檢查總次數與記憶體中的數值是否一致，如果不一致的話代表中間有發生 race condition 的狀況

[範例 Demo](https://codesandbox.io/p/sandbox/atomic-ztf2pk)

<figure><img src=".gitbook/assets/截圖 2023-09-29 下午11.29.34.png" alt=""><figcaption></figcaption></figure>

**建立 SharedArrayBuffer 並傳送訊息**

首先建立 **SharedArrayBuffer**，並將 **max: 每個線程預計計算的次數(預設 1000 次)** 及 **isAtomicEnabled: 是否啟用 Atomic** 也一起傳到 worker 線程

```javascript
// 主線程
const worker = new Worker('public/worker.js');

document.querySelector('button').onclick = (e) => {
  const sab = new SharedArrayBuffer(4);
  const arr = new Uint32Array(sab);

  const max = document.querySelector('.max').value;
  const isAtomicEnabled = document.querySelector('.enable').checked;
  
  worker.postMessage({ arr, max, isAtomicEnabled });
}
```

**主線程改變記憶體中的數值**

主線程在送出訊息給 worker 後，馬上改變 `arr[0]` 這塊記憶體中的數值，這裡利用了 [requestAnimationFrame](https://developer.mozilla.org/zh-TW/docs/Web/API/window/requestAnimationFrame)，要求瀏覽器在每幀中不斷對 `arr[0]` 這塊記憶體一直執行累加操作，直到達到了 **max** 次數後才結束，並把累加後的結果顯示在畫面上

但這裡每輪的累加操作就會根據是否啟用 atomic，而執行不同的方法，有開啟的話就使用 Atomics.add，沒有的話就使用一般矩陣的加法 (arr\[0] += 1)

```javascript
// 主線程
let count = 0;
const add = () => {
  if (count >= max) {
    console.log('main result:', arr[0])
    document.querySelector('.result').textContent = arr[0];
    document.querySelector('button').textContent = '開始計算';
    return;
  }
  count++;
  
  if (isAtomicEnabled) {
    Atomics.add(arr, 0, 1);
  } else {
    arr[0] += 1;
  }

  const value = isAtomicEnabled ? Atomics.load(arr, 0) : arr[0];
  console.log('main:', count, value);
  requestAnimationFrame(add);
}

requestAnimationFrame(add);
```

**worker 線程改變記憶體中的數值**

worker 線程在收到訊息後，也跟主線程執行同樣的邏輯，對同一塊記憶體 `arr[0]`執行累加的操作，累加完畢後將 `arr[0]` 這塊記憶體最後的數值傳遞到主線程，並由主線程顯示在畫面上

```javascript
// worker 線程
self.onmessage = (e) => {
  const { arr, max, isAtomicEnabled } = e.data;

  let count = 0;
  const add = () => {
    if (count >= max) {
      console.log('worker result:', arr[0]);
      self.postMessage(arr[0]);
      return;
    }
    count++;

    if (isAtomicEnabled) {
      Atomics.add(arr, 0, 1);
    } else {
      arr[0] += 1;
    }

    const value = isAtomicEnabled ? Atomics.load(arr, 0) : arr[0];
    console.log('worker:', count, value);
    requestAnimationFrame(add);
  };

  requestAnimationFrame(add);
};
```



### 結果

<figure><img src=".gitbook/assets/截圖 2023-09-30 上午1.10.26.png" alt=""><figcaption></figcaption></figure>



<figure><img src=".gitbook/assets/截圖 2023-09-30 上午1.11.11.png" alt=""><figcaption></figcaption></figure>

最後會發現未啟用原子操作，使用一般矩陣的加法 (arr\[0] +=1) 時，是有可能發生 race condition 的，所以最後相加出來的值不會等於 2000，但當使用原子操作時，可以保證對同一塊記憶體操作時，都是基於當下記憶體的值去做相加，所以可以保證最後的值都會等於 2000



另外大家也可以打開 devtool 中的 console 查看每輪計算的數值，會發現當出現 race condition 時，同一輪中主線程(main) 跟 worker 線程會讀取到同樣的數值(467)，這就像是這篇開頭提到的狀況，兩個線程執行的時間交錯，所以一開始同時讀取到的都是 0，導致最後相加結果為 1 而不是 2，

這裡也是類似的狀況，其中某輪的運算兩個線程同時讀取到的值都是 467，而寫回的時候只更新成 468 而不是 469，所以最後算出來的值當然就會比 2000 還少了

<figure><img src=".gitbook/assets/截圖 2023-09-30 上午1.21.44.png" alt=""><figcaption></figcaption></figure>

**小結**

使用 Atomic 可以避免不同線程操作同一塊記憶體所造成的 race condition 問題，但實際上使用多線程的程式會有許多同步的問題產生，因此正確的方式應該是依賴由具有多線程經驗並且花時間研究記憶體模型的開發人員提供的經過驗證的庫(repository)來處理多線程操作，但 **SharedArrayBuffer** 在 Javascript 的應用裡還處於早期階段，目前似乎還沒有相關的庫可供使用。



### Reference

[Avoiding race conditions in SharedArrayBuffers with Atomics](https://hacks.mozilla.org/2017/06/avoiding-race-conditions-in-sharedarraybuffers-with-atomics/)

漫畫方式學 Atomic 的親切文章

[Using JavaScript SharedArrayBuffers and Atomics](https://blogtitle.github.io/using-javascript-sharedarraybuffers-and-atomics/)
