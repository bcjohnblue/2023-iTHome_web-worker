# 在 Web worker 中使用外部套件

**importScripts**

在 worker 中可以使用 [importScripts](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/importScripts) 將外部的套件引入進來使用，這種方式會將 script 裡的變數都以全域的方式匯入，像下面的例子引入 lodash 的 CDN 後，就可以呼叫 `_` 使用 lodash 的方法

```javascript
importScripts('https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js');

// 使用 lodash 內建的 add 方法
const result = _.add(1, 2);
self.postMessage(result);
```

**避免不同 scripts 間的變數衝突**

有個小地方需要注意的是，因為 `importScripts` 會將 script 中的變數都提升成全域變數，所以當不同 script 間有相同的變數名稱時，會導致錯誤

```javascript
// add.js
const calculate = (num1, num2) => num1 + num2;
// multiply.js
const calculate = (num1, num2) => num1 * num2;

// 由於兩個檔案都有 calculate 函式，會丟出 SyntaxError 錯誤
self.importScripts("./add.js", "./multiply.js");
```

**以模組方式匯入**

因為使用 importScripts 有變數衝突的隱憂，所以在 Chrome 80 後新增了 [module worker](https://web.dev/module-workers/)，可以將 scripts 以模組的方式匯入，避免變數衝突，使用方式是在創建 worker 線程的時候加入 `{type: 'module'}`。

**主線程**

```javascript
const worker = new Worker('./worker.js', {
  type: 'module'
});
```

**worker 線程**

```javascript
import { calculate as add } from './add.mjs';
import { calculate as multiply } from './multiply.mjs';

const addResult = add(1, 2);
const multiplyResult = multiply(1, 2);
```

範例程式碼請參照 [Demo](https://codesandbox.io/s/dedicated-worker-import-p4z7ln)&#x20;
