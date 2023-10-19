const createArray = (max) => {
  return Array.from({ length: max }, (_, i) => i + 1);
};

export const partition = ({ numberCount, workerCount }) => {
  const array = createArray(numberCount);
  const unitLength = Math.ceil(numberCount / workerCount);

  const result = [];

  for (let index = 0; index < workerCount; index++) {
    result[index] = array.splice(0, unitLength);
  }
  return result;
};
