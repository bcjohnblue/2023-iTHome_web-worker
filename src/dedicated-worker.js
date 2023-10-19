// import './main.css';

const worker = new Worker('workers/dedicated-worker.js');

document.querySelector('.post').addEventListener('click', () => {
  const input = document.querySelector('input');
  console.log('v', input.value);
  worker.postMessage(input.value);
});

onmessage = (e) => {
  console.log('從 worker 接收到的資料', e.data);

  // const ul = document.querySelector('ul');
  // const li = document.createElement('li');
  // li.textContent = e.data;
  // ul.appendChild(li);
};
