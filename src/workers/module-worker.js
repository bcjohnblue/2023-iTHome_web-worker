import { add } from '../tests/index.js';

self.onmessage = (e) => {
  const [value1, value2] = e.data;
  console.log(add(value1, value2));
};
