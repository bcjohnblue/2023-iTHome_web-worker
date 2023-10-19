export const watchCheckbox = () => {
  const checkbox = document.querySelector('#hardware-concurrency');
  checkbox.addEventListener('change', (e) => {
    const workerCount = document.querySelector('.worker-count');

    if (checkbox.checked) {
      workerCount.value = navigator.hardwareConcurrency;
      workerCount.disabled = true;
    } else {
      workerCount.disabled = false;
    }
  });
};
