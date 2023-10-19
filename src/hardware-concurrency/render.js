export const renderTime = ({ time, numberCount, workerCount }) => {
  const tBody = document.querySelector('.times table tbody');
  const tr = document.createElement('tr');

  const td1 = document.createElement('td');
  const trLength = Array.from(tBody.querySelectorAll('tr')).length;
  td1.appendChild(document.createTextNode(trLength + 1));

  const td2 = document.createElement('td');
  td2.appendChild(document.createTextNode(`${time} ms`));

  const td3 = document.createElement('td');
  td3.appendChild(document.createTextNode(numberCount));

  const td4 = document.createElement('td');
  td4.appendChild(document.createTextNode(workerCount));

  tr.appendChild(td1);
  tr.appendChild(td2);
  tr.appendChild(td3);
  tr.appendChild(td4);

  tBody.appendChild(tr);
};

export const renderPrimeCount = (count) => {
  const countDOM = document.querySelector('.result');
  countDOM.textContent = count;
};
