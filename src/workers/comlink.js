self.onmessage = (e) => {
  console.log('worker received data', e.data);

  const { type, value } = e.data;

  switch (type) {
    case 'plus': {
      const [num1, num2] = value;
      const result = num1 + num2;
      self.postMessage({ type: 'plus', result });
      break;
    }
    case 'multiply': {
      const [num1, num2] = value;
      const result = num1 * num2;
      self.postMessage({ type: 'multiply', result });
      break;
    }
    default:
      break;
  }
};
