import workerpool from 'https://cdn.jsdelivr.net/npm/workerpool@6.5.0/+esm';

import { findPrimes } from './execution.js';
import { watchCheckbox } from './listeners.js';
import { renderPrimeCount, renderTime } from './render.js';
import { partition } from './partition.js';

watchCheckbox();

const UNIT = 10000;

const runBtn = document.querySelector('.run');
runBtn.addEventListener('click', async (e) => {
  const workerCount = +document.querySelector('.worker-count').value || 1;
  const numberCount =
    (+document.querySelector('.number-count').value || 100) * UNIT;

  const pool = workerpool.pool({ maxWorkers: workerCount });

  const arr = partition({ numberCount, workerCount });

  let time = 0;
  const start = performance.now();
  const promises = arr.map((list) => {
    return pool.exec(findPrimes, [list]);
  });
  const results = await Promise.all(promises);
  const end = performance.now();
  time = Math.round(end - start);

  const primes = results.flat();
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
