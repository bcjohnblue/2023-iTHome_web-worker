const worker = new Worker('./workers/comlink.js');

document.querySelector('button').onclick = () => {
  const plusInputs = document.querySelectorAll('input.plus');
  const plusValues = Array.from(plusInputs).map((plusInput) => {
    return +plusInput.value || 0;
  });
  worker.postMessage({ type: 'plus', value: plusValues });

  const multiplyInputs = document.querySelectorAll('input.multiply');
  const multiplyValues = Array.from(multiplyInputs).map((multiplyInput) => {
    return +multiplyInput.value || 0;
  });
  worker.postMessage({ type: 'multiply', value: multiplyValues });
};

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
