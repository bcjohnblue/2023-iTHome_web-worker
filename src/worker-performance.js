const FACTOR = 1024;
const ONE_KB = FACTOR;
const ONE_MB = FACTOR * ONE_KB;
const ONE_GB = FACTOR * ONE_MB;

const SIZES = [
  {
    type: '1KB',
    value: ONE_KB
  },
  {
    type: '1MB',
    value: ONE_MB
  },
  {
    type: '10MB',
    value: 10 * ONE_MB
  },
  {
    type: '20MB',
    value: 20 * ONE_MB
  },
  {
    type: '100MB',
    value: 100 * ONE_MB
  },
  {
    type: '500MB',
    value: 500 * ONE_MB
  },
  {
    type: '1GB',
    value: ONE_GB
  }
];

const worker = new Worker('./workers/worker-performance.js');

const round = (x) => {
  return Number.parseFloat(x).toFixed(2);
};
function generateRandomArray(size) {
  const t1 = performance.now();
  const data = new Uint8Array(new ArrayBuffer(size.value)).map((_, i) => i);
  const t2 = performance.now();
  console.log(`創建 ${size.type} Array 經過時間：`, `${round(t2 - t1)} ms`);

  return data;
}

const sendMessage = async (data, isTransfer) => {
  return new Promise((resolve) => {
    if (isTransfer) {
      worker.postMessage(data, [data.buffer]);
    } else {
      worker.postMessage(data);
    }
    worker.onmessage = (e) => {
      resolve(e.data);
    };
  });
};
const measure = async (isTransfer) => {
  for (let index = 0; index < SIZES.length; index++) {
    const size = SIZES[index];

    const data = generateRandomArray(size);

    const start = performance.now();
    await sendMessage(data, isTransfer);
    const end = performance.now();
    const time = end - start;

    const resultDOM = document.querySelector('.result');
    const div = document.createElement('div');
    console.log(`傳遞 ${size.type} Array 所需時間：`, `${round(time)} ms`);
    div.textContent = `傳遞 ${size.type} Array 所需時間： ${round(time)} ms`;
    resultDOM.append(div);
  }
};

let isStart = false;
async function start(isTransfer = false) {
  if (isStart) return;
  console.log('start');

  isStart = true;
  const startTime = performance.now();
  if (isTransfer) {
    document.querySelector('.transfer').textContent =
      'Starting... (transfer enabled)';
  } else {
    document.querySelector('.no-transfer').textContent = 'Starting...';
  }

  const resultDOM = document.querySelector('.result');
  const index = document.querySelectorAll('.divider').length;
  const indexDOM = document.createElement('div');
  indexDOM.textContent = `Run: ${index + 1} transfer: ${isTransfer}`;
  resultDOM.append(indexDOM);

  window.scrollTo(0, document.body.scrollHeight);

  await measure(isTransfer);

  isStart = false;
  if (isTransfer) {
    document.querySelector('.transfer').textContent =
      'Start (transfer enabled)';
  } else {
    document.querySelector('.no-transfer').textContent = 'Start';
  }

  const endTime = performance.now();
  const div = document.createElement('div');
  div.textContent = `總耗時： ${round(endTime - startTime)} ms`;
  resultDOM.append(div);

  const divider = document.createElement('div');
  divider.textContent = '---------------------------------';
  divider.className = 'divider';
  resultDOM.append(divider);
}
