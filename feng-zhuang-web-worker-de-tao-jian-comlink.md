# 封裝 Web worker 的套件 - Comlink

今天與明天會介紹一些與 web worker 相關的套件，今天要介紹的 comlink 是 google 團隊開發的套件，讓 web worker 的使用更為方便，以下我們直接藉由範例來看 comlink 與一般使用方式的差別

### 範例

[範例 Demo](https://codesandbox.io/s/comlink-6hvdq9)

<figure><img src=".gitbook/assets/截圖 2023-10-06 上午12.56.39.png" alt=""><figcaption></figcaption></figure>

### **一般使用方法**

在原本的一般方法中會使用 worker.postMessage 將資料傳到 worker 進行運算

```javascript
// 主線程
const worker = new Worker('public/no-comlink-worker.js');

document.querySelector('button').onclick = () => {
  const plusInputs = document.querySelectorAll('input.plus');
  const plusValues = Array.from(plusInputs).map((plusInput) => {
    return +plusInput.value || 0;
  });
  // 將 [2, 3] 傳遞到 worker 進行加法運算
  worker.postMessage({ type: 'plus', value: plusValues });

  const multiplyInputs = document.querySelectorAll('input.multiply');
  const multiplyValues = Array.from(multiplyInputs).map((multiplyInput) => {
    return +multiplyInput.value || 0;
  });
  // 將 [2, 3] 傳遞到 worker 進行乘法運算
  worker.postMessage({ type: 'multiply', value: multiplyValues });
};
```

接著 worker 線程需要根據傳來的 type 決定要進行哪種邏輯的運算

```javascript
// worker 線程
self.onmessage = (e) => {
  console.log("worker received data", e.data);

  const { type, value } = e.data;

  switch (type) {
    case "plus": {
      const [num1, num2] = value;
      const result = num1 + num2;
      self.postMessage({ type: "plus", result });
      break;
    }
    case "multiply": {
      const [num1, num2] = value;
      const result = num1 * num2;
      self.postMessage({ type: "multiply", result });
      break;
    }
    default:
      break;
  }
};
```

然後主線程使用 worker.onmessage 接收 worker 運算完後的資料

```javascript
// 主線程
worker.onmessage = (e) => {
  const { type, result } = e.data;

  switch (type) {
    case 'plus': {
      document.querySelector('.result-plus').textContent = result;
      break;
    }
    case 'multiply': {
      document.querySelector('.result-multiply').textContent = result;
      break;
    }
    default:
      break;
  }
};
```

我們可以看到當有不同邏輯需要在 worker 做處理時 (加法 plus 與 乘法 multiply)，都需要額外多傳 type，以及加一堆 switch case 來判斷要執行的是哪種邏輯，以及在主線程接收到資料後 (onmessage) 也需要多判斷 type 來決定最後的傳回來的數值要怎麼處理，當一個 worker 中要處理的邏輯或函式變多的時候，每次這樣判斷 type 的處理是很麻煩的，而藉由使用 comlink 我們可以簡化這一塊的麻煩之處，以下讓我們看看用 comlink 改寫後的程式碼

### 使用 Comlink

首先我們先來看 worker 中的程式碼，在 worker 中不再使用 self.onmessage 接收訊息，反之用的是一個簡單的 calculate 物件，並把需要運算的邏輯定義出來，最終使用 Comlink.expose(calculate)，讓主線程可以直接取用到 calculate 物件

```javascript
// worker 線程
importScripts("https://unpkg.com/comlink/dist/umd/comlink.js");

const calculate = {
  plus(value) {
    const [num1, num2] = value;
    return num1 + num2;
  },
  multiply(value) {
    const [num1, num2] = value;
    return num1 * num2;
  }
};

Comlink.expose(calculate);
```

接著在主線程中可以直接使用 Comlink.wrap(worker) 方式取用到 calculate 物件，並可以直接呼叫底下的方法進行運算，而每個方法都被封裝成 promise 的回傳值，所以可以很方便的拿到 worker 執行完後的結果

```javascript
// 主線程
import * as Comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";

const worker = new Worker("public/worker.js");
// 取用到 calculate 物件
const calculate = Comlink.wrap(worker);

document.querySelector("button").onclick = async () => {
  const plusInputs = document.querySelectorAll("input.plus");
  const plusValues = Array.from(plusInputs).map((plusInput) => {
    return +plusInput.value || 0;
  });
  // 呼叫 plus 方法
  const plusResult = await calculate.plus(plusValues);
  document.querySelector(".result-plus").textContent = plusResult;

  const multiplyInputs = document.querySelectorAll("input.multiply");
  const multiplyValues = Array.from(multiplyInputs).map((multiplyInput) => {
    return +multiplyInput.value || 0;
  });
  // 呼叫 multiply 方法
  const multiplyResult = await calculate.multiply(multiplyValues);
  document.querySelector(".result-multiply").textContent = multiplyResult;
};
```



### **總結**

使用 comlink 可以簡化 web worker 中原本 postMessage 及 onMessage 繁複的接收訊息寫法，使得程式的寫法更簡潔也更方便使用



### Reference

[Comlink github repo](https://github.com/GoogleChromeLabs/comlink)
