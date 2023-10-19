import * as Comlink from 'https://unpkg.com/comlink/dist/esm/comlink.mjs';

const worker = new Worker('./workers/comlink2.js');
const calculate = Comlink.wrap(worker);

document.querySelector('button').onclick = async () => {
  const plusInputs = document.querySelectorAll('input.plus');
  const plusValues = Array.from(plusInputs).map((plusInput) => {
    return +plusInput.value || 0;
  });
  const plusResult = await calculate.plus(plusValues)
  document.querySelector('.result-plus').textContent = plusResult;

  const multiplyInputs = document.querySelectorAll('input.multiply');
  const multiplyValues = Array.from(multiplyInputs).map((multiplyInput) => {
    return +multiplyInput.value || 0;
  });
  const multiplyResult = await calculate.multiply(multiplyValues)
  document.querySelector('.result-multiply').textContent = multiplyResult;
};

// worker.onmessage = (e) => {
//   const { type, result } = e.data;

//   switch (type) {
//     case 'plus': {
//       document.querySelector('.result-plus').textContent = result;
//       break;
//     }
//     case 'multiply': {
//       document.querySelector('.result-multiply').textContent = result;
//       break;
//     }
//     default:
//       break;
//   }
// };
