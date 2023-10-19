importScripts('https://unpkg.com/comlink/dist/umd/comlink.js');

const calculate = {
  plus(value) {
    const [num1, num2] = value;
    return num1 + num2;
  },
  multiply(value) {
    const [num1, num2] = value;
    return num1 * num2;
  }
};

Comlink.expose(calculate);
