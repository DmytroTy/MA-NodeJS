const { promisify } = require('util');

function generateDiscount(callback) {
  setTimeout(() => {
    const discount = Math.floor(Math.random() * 99 + 1);
    if (discount < 20) callback(null, discount);
    else callback(new Error('The store cannot afford such big discounts.'));
  }, 50);
}

const generateDiscountPromisified = promisify(generateDiscount);

function generateDiscountPromise() {
  return new Promise((resolve, reject) => {
    generateDiscount((error, discount) => (error ? reject(error) : resolve(discount)));
  });
}

function getDiscountCallback(times, discounts, callback) {
  generateDiscount((err, discount) => {
    if (err) return getDiscountCallback(times, discounts, callback);

    discounts.push(discount);
    if (discounts.length < times) getDiscountCallback(times, discounts, callback);
    else callback(discounts);
    return true;
  });
}

function getDiscountPromise(times, discounts, callback) {
  generateDiscountPromisified()
    .then((discount) => {
      discounts.push(discount);
      if (discounts.length < times) getDiscountPromise(times, discounts, callback);
      else callback(discounts);
    })
    .catch(() => getDiscountPromise(times, discounts, callback));
}

async function getDiscountAsyncAwait() {
  try {
    return await generateDiscountPromise();
  } catch (err) {
    return getDiscountAsyncAwait();
  }
}

module.exports = {
  getDiscountCallback,
  getDiscountPromise,
  getDiscountAsyncAwait,
};
