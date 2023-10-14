# 使用多個 Web worker 進行平行運算 - workerpool

[workerpool](https://github.com/josdejong/workerpool) 用 web worker 實作了 thread pool 的概念，讓程式可以做到高效的平行運算

### 什麼是執行緒池 (Thread pool)？

thread pool 可以視為一連串的運算單元合併起來的架構，下圖綠色部分共有六個 thread 可以分別執行不同的運算，每一個 thread 對應到的就是一個 web worker 線程

在一開始會有許多的 tasks 放入 task queue 中，等待 thread pool 中有 thread 將完成原本的運算任務後，就會有從 task queue 中拿取新的 task 到 thread pool 中執行，thread pool 中執行完的任務就會變成 completed tasks



<figure><img src=".gitbook/assets/截圖 2023-10-08 下午12.17.58.png" alt=""><figcaption></figcaption></figure>

接著讓我們來看看 workerpool 的一些基本用法

### 創建 thread pool

我們可以在主線程中，引入 workerpool 的 cdn 連結，接著使用 workerpool.pool，創建出 thread pool

```javascript
import workerpool from 'https://cdn.jsdelivr.net/npm/workerpool@6.5.0/+esm';

const pool = workerpool.pool({ maxWorkers: workerCount });
```

### 在 thread pool 中執行程式

創建出 pool 之後可以使用 pool.exec() 呼叫要執行的函式

```javascript
function add(a, b) {
  return a + b;
}

pool
  .exec(add, [3, 4])
  .then(function (result) {
    console.log('result', result); // outputs 7
  })
```

瞭解了 workerpool 的基礎用法後，一樣讓我們用個範例來看看使用 thread pool 如何做到高效的平行運算吧

### 範例

[範例 Demo](https://codesandbox.io/s/workerpool-q93ysf)



**目的**

1. 使用多個 Web worker 組成的 workerpool 進行平行運算，確認執行速度是否變快

**說明**

1. 範例中我們打算利用 Web worker 尋找質數，程式中會有兩個變數

* numberCount

決定在多少數字以下尋找質數，例如：numberCount: 10，找到的質數應該是 \[2, 3, 5, 7]

* workerCount

使用 worker 的數量，這代表在 thread pool 中最多會使用到幾個 worker 線程運算

2. 使用電腦 CPU 核心數 (hardwareConcurrecy)

[hardwareConcurrecy](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/hardwareConcurrency) 可以取得電腦中邏輯運算單元的數量，這也代表著最多可同時運行的 worker 數量，例如：從我的電腦中可以查到 CPU 核心的數量是 10，而瀏覽器實作 hardwareConcurrecy 時通常會回傳較低數量的邏輯運算單元，所以在我的 chrome 瀏覽器中回傳的 hardwareConcurrecy 會是 8

當勾選 **使用電腦 CPU 核心數 (hardwareConcurrecy)** 後，**使用 worker 的數量** 就會被固定成 hardwareConcurrecy 回傳的值

3. 按下 Run 按鈕後會根據 **尋找質數的上限數字(numberCount)、使用 worker 數(workerCount)** 在 worker 線程中找出質數
4. 執行完後，運算的時間 會以表格方式顯示出來
5. 根據不同的 **使用 worker 數(workerCount)**，查看執行效率的差異&#x20;



<figure><img src=".gitbook/assets/截圖 2023-10-08 下午10.52.33.png" alt=""><figcaption></figcaption></figure>

### **創建 thread pool**&#x20;

一開始會根據填入的 **使用 worker 數(workerCount)**，創建 thread pool 中最多可以運行的 worker 線程數量

```javascript
const pool = workerpool.pool({ maxWorkers: workerCount });
```

### 分割所有要拿來找出質數的數字

這裡會將 **尋找質數的上限數字(numberCount)、使用 worker 數(workerCount) 丟入 partition 函數** 分割出要尋找質數的數字群們

例如：

numberCount: 100 萬

workerCount: 10

會把 100 萬個數字分割成 10 個群組，第一個群是 1\~10 萬，接著 10\~20萬，一直到最後一群是 90\~100萬

```javascript
const partitionArray = partition({ numberCount, workerCount });
```

### 使用 workerpool 尋找質數

接著使用 pool.exec() 於各 worker 線程中執行 **尋找質數(findPrimes)** 函式

```javascript
const promises = partitionArray.map((partitionList) => {
  // 將分割出來的數字丟入 findPrimes 中
  return pool.exec(findPrimes, [partitionList]);
});
const results = await Promise.all(promises);
// 所有找到的質數 (ex. [2, 3, 5, ...])
const primes = results.flat();
```



### 結果

<figure><img src=".gitbook/assets/截圖 2023-10-08 下午11.56.15.png" alt=""><figcaption></figcaption></figure>

1. 可以發現當使用 1 個 worker 時執行的時間最長
2. 當 worker 數量逐步增多，整體運算的時間也會變快，大約到 **電腦 CPU 核心數 (hardwareConcurrecy)** 8 個時，執行時間大約最短
3. 雖然 worker 數量可以無限制地增加，但同時能使用 CPU 核心運算的資源應該是有限的，過多增加的 worker 數量反而會拖慢整體運算時間

### **總結**

雖然隨著不同資料量、不同的運算方式，適合使用的 worker 線程數量應該都不一定，但盡量以 **電腦 CPU 核心數 (hardwareConcurrecy)** 創建出 thread pool 的數量，應該是可以充分運用 CPU 資源，盡量縮短整體運算的時間



### Reference

[workerpool github repo](https://github.com/josdejong/workerpool)

[wiki 執行緒池](https://en.wikipedia.org/wiki/Thread\_pool)

[Number of Web Workers Limit](https://stackoverflow.com/questions/13574158/number-of-web-workers-limit)
