# 使用 structuredClone 複製數據到 Web worker

主線程與 worker 線程之間通常會使用 `postMessage` 傳遞資料，為避免不同的線程操作同一筆資料會導致不同步的問題，實際上背後會執行一個 [structuredClone](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone) 的算法，類似於進行 **深複製 (deep copy)** 後再傳遞給出去。

**主線程**

```javascript
const worker = new Worker('worker.js');
// 背後會執行 structuredClone，複製後再傳遞
worker.postMessage({
  type: '',
  payload: 'message'
}); 
```

**worker 線程**

```javascript
self.ommessage = (e) => {
  console.log(e.data) // worker 接收到的是複製的資料
};
```

`structuredClone` 目前已經被[各大瀏覽器支持](https://caniuse.com/?search=structuredClone)，可能是未來進行**深複製**時統一的寫法，但在不同狀況下跟一些常見的**深複製**方式還是不太一樣，為了理解不同方式之間的差異，我寫了個範例比較 `structuredClone`、[lodash.cloneDeep](https://lodash.com/docs/4.17.15#cloneDeep)、[JSON.stringify()](https://medium.com/itsems-frontend/javascript-json-stringify-and-json-parse-7a1251d3824c) 這三種方式的不同點：

<figure><img src=".gitbook/assets/截圖 2023-09-19 下午10.10.01.png" alt=""><figcaption><p>深複製的三種方式比較</p></figcaption></figure>

範例 [demo](https://codesandbox.io/s/structuredclone-k3my9g)

**function**&#x20;

`structuredClone` 跟 `JSON.stringify()` 都沒辦法解析，會丟出 Error

```javascript
const func = function () {};
table["function"] = {
  structuredClone: safe(window.structuredClone)(func), // Error
  "lodash.cloneDeep": cloneDeep(func),
  "JSON.stringify": safeJSON(func) // Error
};
```

**class created by function** **&** **class instance**

從範例中可以發現，雖然 一般屬性(name) 三個都有複製到，但只有 `lodash.cloneDeep` 有複製到 prototype 的屬性 (getName)

```javascript
// class created by function (not plain object)
const FunctionClass = function (name) {
  this.name = name;
};
FunctionClass.prototype.getName = "myName";
const functionClassInstance = new FunctionClass("myName");
table["class created by function"] = {
  structuredClone: safe(window.structuredClone)(functionClassInstance),
  "lodash.cloneDeep": cloneDeep(functionClassInstance),
  "JSON.stringify": safeJSON(functionClassInstance)
};

// class instance (not plain object)
class ClassInstance {
  constructor(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }
}
const classInstance = new ClassInstance("myName");
table["class instance"] = {
  structuredClone: window.structuredClone(classInstance),
  "lodash.cloneDeep": cloneDeep(classInstance),
  "JSON.stringify": safeJSON(classInstance)
};
```

**Map & Set & ArrayBuffer**

這三個都算是 Javascript 裡比較不一樣的 **物件(object)**，`structuredClone` 跟 `lodash.cloneDeep` 都可以正確複製，但 `JSON.stringify()` 會變成一個空物件

<pre class="language-javascript"><code class="lang-javascript"><strong>// Map
</strong>const map = new Map([
  ["1", "one"],
  ["2", "two"]
]);
table["Map"] = {
  structuredClone: window.structuredClone(map), // Map
  "lodash.cloneDeep": cloneDeep(map), // Map
  "JSON.stringify": safeJSON(map) // {}
};

// Set
const set = new Set([
  ["1", "one"],
  ["2", "two"]
]);
table["Set"] = {
  structuredClone: window.structuredClone(set), // Set
  "lodash.cloneDeep": cloneDeep(set), // Set
  "JSON.stringify": safeJSON(set) // {}
};

// array buffer
const arrayBuffer = new ArrayBuffer(8);
table["ArrayBuffer"] = {
  structuredClone: window.structuredClone(arrayBuffer), // ArrayBuffer
  "lodash.cloneDeep": cloneDeep(arrayBuffer), // ArrayBuffer
  "JSON.stringify": safeJSON(arrayBuffer) // {}
};
</code></pre>

**Symbol**

`structuredClone` 跟 `JSON.stringify()` 都會丟出錯誤，只有 `lodash.cloneDeep` 不會丟出錯誤，反而是回傳一個新的 **Symbol**

```javascript
// symbol
const symbol = Symbol();
table["symbol"] = {
  structuredClone: safe(window.structuredClone)(symbol), // Error
  "lodash.cloneDeep": cloneDeep(symbol), // Symbol
  "JSON.stringify": safeJSON(symbol) // Error
};
```

**Date()**

`structuredClone` 跟 `lodash.cloneDeep` 都正確的複製了 **Date()** 函數與它的原型方法，而 `JSON.stringify()` 轉換回來變成字串了

```javascript
// Date
const date = new Date();
table["Date()"] = {
  structuredClone: window.structuredClone(date), // Date
  "lodash.cloneDeep": cloneDeep(date), // Date
  "JSON.stringify": safeJSON(date) // string
};
```

**circular reference**

一樣是 `structuredClone` 跟 `lodash.cloneDeep` 都正確的複製，而 `JSON.stringify()` 直接丟出錯誤

```javascript
// circular reference
const circular = { name: "MDN" };
circular.itself = circular;
table["circular reference"] = {
  structuredClone: window.structuredClone(circular),
  "lodash.cloneDeep": cloneDeep(circular),
  "JSON.stringify": safeJSON(circular) // Error
};
```

**HTML Element**

`structuredClone` 會丟出錯誤，而 `lodash.cloneDeep` 跟 `JSON.stringify()` 複製出來的結果是一個空物件

```javascript
// DOM
const element = document.createElement("div");
table["HTML Element"] = {
  structuredClone: safe(window.structuredClone)(element), // Error
  "lodash.cloneDeep": cloneDeep(element), // {}
  "JSON.stringify": safeJSON(element) // {}
};
```

**File**

`structuredClone` 是唯一一個可以正確複製檔案的，`lodash.cloneDeep` 跟 `JSON.stringify()` 複製出來的結果是一個空物件

```javascript
// File
const file = new File(["file"], "file.txt", {
  type: "text/plain"
});
table["File"] = {
  structuredClone: window.structuredClone(file), // File
  "lodash.cloneDeep": cloneDeep(file), // {}
  "JSON.stringify": safeJSON(file) // {}
};
```

### 小結

1. `lodash.cloneDeep` 不愧是有名的套件，各種狀況下它都不會丟出錯誤，不需額外做錯誤處理感覺蠻貼心的。
2. 除了以上嘗試的 function, symbol, HTML Element 等無法被 `structuredClone` 解析的物件，[Things that don't work with structured clone](https://developer.mozilla.org/en-US/docs/Web/API/Web\_Workers\_API/Structured\_clone\_algorithm#things\_that\_dont\_work\_with\_structured\_clone) 也羅列了其他無法解析的狀況，而除了這些無法解析的物件外，其餘可以被解析的物件都統稱叫 [Serializable object](https://developer.mozilla.org/en-US/docs/Glossary/Serializable\_object)，這意味著這些物件都可以被 serialized 跟 deserialized，因此可以做到把資料存在硬碟裡，之後再從硬碟裡把資料取出來。
