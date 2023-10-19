export const findPrimes = (nums) => {
  return nums.filter((num) => isPrime(num));

  function isPrime(number) {
    // 负数、小于 2 的数不是质数
    if (number <= 1) {
      return false;
    }

    // 2 和 3 是质数
    if (number <= 3) {
      return true;
    }

    // 排除偶数
    if (number % 2 === 0 || number % 3 === 0) {
      return false;
    }

    // 遍历检查可能的质数因子，从 5 开始，每次递增 6
    for (let i = 5; i * i <= number; i += 6) {
      if (number % i === 0 || number % (i + 2) === 0) {
        return false;
      }
    }

    return true;
  }
};
