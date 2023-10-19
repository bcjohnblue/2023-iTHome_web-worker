const FACTOR = 1024;
const ONE_KB = FACTOR;
const ONE_MB = FACTOR * ONE_KB;
const ONE_GB = FACTOR * ONE_MB;

const sizes = [
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
    type: '30MB',
    value: 30 * ONE_MB
  },
  {
    type: '100MB',
    value: 100 * ONE_MB
  },
  {
    type: '300MB',
    value: 300 * ONE_MB
  },
  {
    type: '1GB',
    value: ONE_GB
  }
];

const round = (x) => {
  return Number.parseFloat(x).toFixed(2);
};
const map = new Map();
function generateRandomArray(size) {
  // if (map.has(size.type)) {
  //   return map.get(size.type);
  // }

  const t1 = performance.now();
  const data = new Uint8Array(new ArrayBuffer(size.value));
  // console.log('data', data);
  const t2 = performance.now();
  console.log(`創建 ${size.type} Array 經過時間：`, `${round(t2 - t1)} ms`);

  map.set(size.type, data);

  return data;
}

const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;

const statistic = (size, iteration = 10) => {
  const result = [];

  for (let i = 0; i < iteration; i++) {
    const data = generateRandomArray(size);

    const t1 = performance.now();
    window.structuredClone(data);
    const t2 = performance.now();

    result.push(t2 - t1);
  }

  return average(result);
};

let isStart = false;

const startMeasure = async () => {
  return new Promise((resolve, reject) => {
    try {
      if (!window.structuredClone) {
        console.log('瀏覽器不支援 structuredClone');
        resolve();
      }

      const resultDOM = document.querySelector('.result');

      let count = 0;
      sizes.forEach((size) => {
        setTimeout(() => {
          const time = statistic(size);

          console.log(
            `複製 ${size.type} Array 所需時間：`,
            `${round(time)} ms`
          );
          const div = document.createElement('div');
          div.textContent = `複製 ${size.type} Array 所需時間： ${round(
            time
          )} ms`;
          resultDOM.append(div);

          count++;
          if (count >= sizes.length) resolve();
        }, 0);
      });
    } catch (error) {
      reject(error);
    }
  });
};

async function start() {
  if (isStart) return;
  console.log('start');

  isStart = true;
  document.querySelector('button').textContent = 'Starting...';

  const resultDOM = document.querySelector('.result');
  const index = document.querySelectorAll('.divider').length;
  const indexDOM = document.createElement('div');
  indexDOM.textContent = `Run: ${index + 1}`;
  resultDOM.append(indexDOM);

  const startTime = performance.now();
  await startMeasure();

  isStart = false;
  document.querySelector('button').textContent = 'Start';

  const endTime = performance.now();
  const div = document.createElement('div');
  div.textContent = `總耗時： ${round(endTime - startTime)} ms`;
  resultDOM.append(div);

  const divider = document.createElement('div');
  divider.textContent = '------------------';
  divider.className = 'divider';
  resultDOM.append(divider);
}
