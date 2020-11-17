const {
  findGoods,
  findGoodsWithMaxCost,
  discountCallback,
  discountPromise,
  discountAsyncAwait,
  standardize,
  newData,
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

  if (method === 'GET' && url.startsWith('/goods?'))
    return !queryParams.parameter || !queryParams.value
      ? incorrectParameters(response)
      : findGoods(response, queryParams);
  if (method === 'GET' && url === '/goods-with-max-cost') return findGoodsWithMaxCost(response);
  if (method === 'GET' && url === '/discount-callback') return discountCallback(response);
  if (method === 'GET' && url === '/discount-promise') return discountPromise(response);
  if (method === 'GET' && url === '/discount-async-await') return discountAsyncAwait(response);
  if (method === 'GET' && url === '/standardize') return standardize(response);
  if (method === 'POST' && url === '/new-data') return newData(data, response);
  return notFound(response);
};
