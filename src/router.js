const {
  findGoods,
  findGoodsWithMaxCost,
  discountCallback,
  discountPromise,
  discountAsyncAwait,
  standardize,
  newData,
  switchStorage,
} = require('./controller');

function notFound(response) {
  response.statusCode = 404;
  response.write(JSON.stringify({ error: '404', message: '404 Not found' }));
  response.end();
}

function incorrectParameters(response) {
  response.statusCode = 406;
  response.write(JSON.stringify({ error: '406', message: '406 Incorrect parameters' }));
  response.end();
}

module.exports = (request, response) => {
  const { url, method, queryParams, body: data } = request;

  response.setHeader('Content-Type', 'application/json');

  if (method === 'GET')
    // eslint-disable-next-line default-case
    switch (true) {
      case url.startsWith('/goods?'):
        return !queryParams.parameter || !queryParams.value
          ? incorrectParameters(response)
          : findGoods(response, queryParams);
      case url === '/goods-with-max-cost':
        return findGoodsWithMaxCost(response);
      case url === '/discount-callback':
        return discountCallback(response);
      case url === '/discount-promise':
        return discountPromise(response);
      case url === '/discount-async-await':
        return discountAsyncAwait(response);
      case url === '/standardize':
        return standardize(response);
      case url.startsWith('/switch?storage='):
        return switchStorage(response, queryParams);
    }
  if (method === 'POST' && url === '/new-data') return newData(data, response);
  return notFound(response);
};
