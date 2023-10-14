# 在 Web worker 中處理音效 - AudioWorklet

### 什麼是 Worklet?

官方文件提到 [Worklet](https://developer.mozilla.org/en-US/docs/Web/API/Worklet) 是輕量級的 web worker，使網路開發人員可以存取低階的渲染管道

### Worklet 種類

MDN 上列出來的有三種，但其中的 AnimationWorklet 跟 LayoutWorklet 似乎還停留在 spec 階段，所以下面打算只介紹控制音訊的 AudioWorklet

<figure><img src=".gitbook/assets/截圖 2023-09-30 下午10.38.33.png" alt=""><figcaption></figcaption></figure>

### AudioWorklet

在 [AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet) 出現之前，瀏覽器提供了 [ScriptProcessorNode](https://developer.mozilla.org/en-US/docs/Web/API/ScriptProcessorNode) 供開發者在網頁上處理音訊，但使用 ScriptProcessorNode 操作音訊是執行在主線程上面的，因此有可能導致 UI 畫面的阻塞，所以在 Chrome 64 後才推出了 AudioWorklet，AudioWorklet 運行在額外的音訊線程([AudioWorkletGlobalScope](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope))，避免了主線程資源的佔用

### 範例

以下我們直接透過 [Google AudioWorklet example](https://googlechromelabs.github.io/web-audio-samples/audio-worklet/basic/hello-audio-worklet/)，實際看看怎麼在網頁上操作音訊

在按下按鈕後網頁會播放一聲 440Hz 的聲音，請大家在操作前先把聲音調小，不然可能會突然嚇到

<figure><img src=".gitbook/assets/截圖 2023-09-30 下午11.10.20.png" alt=""><figcaption></figcaption></figure>

**建立 AudioContext**

首先所有音訊操作的都需要在一個 音訊上下文中(**AudioContext**)，所以一開始會先建立 **AudioContext**，接著再按下 START 按鈕後執行 `startAudio`

```javascript
const audioContext = new AudioContext();

window.addEventListener('load', async () => {
  const buttonEl = document.getElementById('button-start');
  buttonEl.disabled = false;
  buttonEl.addEventListener('click', async () => {
    await startAudio(audioContext);
    audioContext.resume();
    buttonEl.disabled = true;
    buttonEl.textContent = 'Playing...';
  }, false);
});
```

**開始播放音訊**

```javascript
const startAudio = async (context) => {
  await context.audioWorklet.addModule('bypass-processor.js');
  const oscillator = new OscillatorNode(context);
  const bypasser = new AudioWorkletNode(context, 'bypass-processor');
  oscillator.connect(bypasser).connect(context.destination);
  oscillator.start();
};
```

首先會呼叫 [Worklet.addModule](https://developer.mozilla.org/en-US/docs/Web/API/Worklet/addModule) 將自定義的 bypass-processor.js (後面會再介紹到這個檔案) 以模組方式加載到 AudioContext 裡

```javascript
await context.audioWorklet.addModule('bypass-processor.js');
```

接著呼叫 [OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode/OscillatorNode)，OscillatorNode 可以建構新的音訊波形，預設波形是正弦波(sine)、頻率是 440 Hz

```javascript
// context - 使用的 AudioContext 
// options - 可以設定波形、頻率等參數
const oscillator = new OscillatorNode(context, options);
```

例如：以下建立 660 Hz 的正弦波

```javascript
const options = {
  type: 'sine',
  frequency: 660
}
const oscillator = new OscillatorNode(context, options);
```

下一步建立 [AudioWorkletNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/AudioWorkletNode) 實例，AudioWorkletNode 代表創建一個自定義的音訊節點，第二個參數就是我們之前加載進來的檔案名稱

```javascript
const bypasser = new AudioWorkletNode(context, 'bypass-processor');
```

接著會將建立好的 OscillatorNode 連接到自定義的 AudioWorkletNode(bypasser)，再連接到整個 [AudioContext 最終的目的地 (destination)](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/destination)，這個最終目的地可以視為播放聲音出來的設備，例如喇叭

```javascript
oscillator.connect(bypasser).connect(context.destination);
```

最後呼叫[ start 方法](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/start)，開始播放音訊

```javascript
oscillator.start();
```



**音訊路由圖**

上面這一連串使用到的方法，我想乍看之下難以理解，但搭配以下這張 [音訊路由圖](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode#the\_audio\_routing\_graph) 大概會有點感覺，整個音訊的操作都限制在黃色範圍內的 AudioContext 裡，而以上程式碼所做的事情大部分就是創立 **音訊節點(AudioNode)，**並把各節點以 [connect](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/connect) 的方式連接起來，當所有音訊節點的關聯性都連結好後，最後一步是呼叫 connect(context.destination)，將所有節點連接到右下角的喇叭等擴音設備，準備進行播放

<figure><img src="https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/webaudiobasics.png" alt=""><figcaption></figcaption></figure>

**創建自訂音訊**

在創建自訂音訊的時候有以下幾個步驟：

1. 建立一個單獨的檔案，即 bypass-processor.js
2. 在檔案中需要擴展 AudioWorkletProcessor 類別，並且其中需要提供 [process()](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process) 方法
3. 需要呼叫 [registerProcessor](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope/registerProcessor) 方法，註冊第二步中建立的類別
4. 使用 [Worklet.addModule](https://developer.mozilla.org/en-US/docs/Web/API/Worklet/addModule) 將檔案載入到 AudioContext 中
5. 藉由 [AudioWorkletNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/AudioWorkletNode) 實例將第二步自定義的類別在其中實例化
6. 將音訊節點連接到其他節點 (就是以上所說的 connect)

其中 1\~3 步驟如以下所示，4\~6 步驟是上面已經提過的



**自訂音訊檔案**

以下創建 bypass-processor.js 檔案處理自訂音訊，input 跟 output 分別對應輸入跟輸出的音源，其中 BypassProcessor 單純複製輸入的音源到輸出，沒有做任何額外處理，process 方法的 [回傳值](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process#return\_value)為 true 強制使 AudioWorkletNode 的狀態是 active 的

最後一行呼叫 registerProcessor 註冊 BypassProcessor 並給他一個名稱 'bypass-processor'

```javascript
// bypass-processor.js
class BypassProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    // 預設只有單一個 input 跟 output.
    const input = inputs[0];
    const output = outputs[0];

    for (let channel = 0; channel < output.length; ++channel) {
      output[channel].set(input[channel]);
    }

    return true;
  }
}

registerProcessor('bypass-processor', BypassProcessor);
```



**小結**

以上範例輸出一個最簡單的 440 Hz 正弦波，還沒有牽涉到任何對於音訊的額外處理，實在沒想到在網頁中處理音訊這麼複雜，但總之使用 AudioWorklet 可以使用額外獨立的線程處理音訊，避免影響到主線程 UI 的渲染

### Reference

[Enter Audio Worklet](https://developer.chrome.com/blog/audio-worklet/)
