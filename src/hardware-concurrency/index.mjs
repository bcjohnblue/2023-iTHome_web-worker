import { findPrimes } from './execution.js';
import { watchCheckbox } from './listeners.js';
import { renderPrimeCount, renderTime } from './render.js';
import { partition } from './partition.js';

watchCheckbox();

const createWorker = () => {
  return new Worker('workers/hardware-concurrency.js');
};

const UNIT = 10000;

const runBtn = document.querySelector('.run');
runBtn.addEventListener('click', async (e) => {
  const workerCount = +document.querySelector('.worker-count').value || 1;
  const numberCount =
    (+document.querySelector('.number-count').value || 100) * UNIT;

  const partitionArray = partition({ numberCount, workerCount });
  const workers = Array.from({ length: partitionArray.length }, createWorker);

  let time = 0;
  const start = performance.now();
  const promises = workers.map((worker, index) => {
    const nums = partitionArray[index];
    return findPrimes({ worker, nums });
  });
  const result = await Promise.all(promises);
  const end = performance.now();
  time = Math.round(end - start);

  const primes = result.flat();
  console.log(`primes`, primes);

  renderPrimeCount(primes.length);
  renderTime({ time, numberCount: numberCount / UNIT, workerCount });
});

const clearBtn = document.querySelector('.clear');
clearBtn.addEventListener('click', async (e) => {
  const tBody = document.querySelector('.times table tbody');
  tBody.innerHTML = '';

  const result = document.querySelector('.result');
  result.innerHTML = '';
});

// const runBtn = document.querySelector('.run');
// runBtn.addEventListener('click', async (e) => {
//   const workerCount = +document.querySelector('.worker-count').value || 1;
//   const numberCount =
//     (+document.querySelector('.number-count').value || 100) * UNIT;

//   const pool = workerpool.pool({ maxWorkers: workerCount });

//   const arr = partition({ numberCount, workerCount });
//   // console.log('arr', arr);

//   let time = 0;
//   const start = performance.now();
//   const promises = arr.map((list) => {
//     // console.log('list', list);
//     return pool.exec(findPrimes, [list]);
//   });
//   const [primes] = await Promise.all(promises);
//   const end = performance.now();
//   time = Math.round(end - start);

//   console.log(`primes`, primes);

//   renderPrimeCount(primes.length);
//   renderTime({ time, numberCount: numberCount / UNIT, workerCount });
// });
