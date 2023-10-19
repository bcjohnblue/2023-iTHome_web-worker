const createArray = (max) => {
  return Array.from({ length: max }, (v, i) => i + 1);
};

const createWorker = () => {
  return new Worker('workers/hardware-concurrency.js');
};

// function isPrime(number) {
//   // 负数、小于 2 的数不是质数
//   if (number <= 1) {
//     return false;
//   }

//   // 2 和 3 是质数
//   if (number <= 3) {
//     return true;
//   }

//   // 排除偶数
//   if (number % 2 === 0 || number % 3 === 0) {
//     return false;
//   }

//   // 遍历检查可能的质数因子，从 5 开始，每次递增 6
//   for (let i = 5; i * i <= number; i += 6) {
//     if (number % i === 0 || number % (i + 2) === 0) {
//       return false;
//     }
//   }

//   return true;
// }

export const findPrimes = ({ worker, nums }) => {
  return new Promise((resolve) => {
    worker.postMessage({ nums });
    worker.onmessage = (e) => {
      const { primes } = e.data;
      // worker.terminate();
      resolve(primes);
    };
  });
};

// export const findPrimes = ({ workers, partitionArray }) => {
//   return new Promise((resolve) => {
//     // const array = createArray(numberCount);
//     // const unitLength = Math.ceil(array.length / workerCount);

//     let totalPrimes = [];
//     let done = 0;

//     const workers = Array.from({ length: partitionArray.length }, createWorker);
//     workers.forEach((worker, index) => {
//       worker.postMessage({ nums: partitionArray[index] });

//       worker.onmessage = (e) => {
//         const { primes } = e.data;
//         totalPrimes = totalPrimes.concat(primes);
//         worker.terminate();

//         if (++done >= workerCount) {
//           resolve(totalPrimes);
//         }
//       };
//     });
//   });
// };
