const {
  findGoods,
  findGoodsWithMaxCost,
  discountCallback,
  discountPromise,
  discountAsyncAwait,
  standardize,
  newData,
  switchStorage,
  uploadCsv,
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

function handleRoutes(request, response) {
  const { url, method, queryParams, body: data } = request;

  response.setHeader('Content-Type', 'application/json');

  if (method === 'GET')
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
      default:
        return notFound(response);
    }
  if (method === 'POST' && url === '/new-data') return newData(data, response);
  return notFound(response);
}

async function handleStreamRoutes(request, response) {
  const { url, method } = request;

  response.setHeader('Content-Type', 'application/json');

  if (method === 'POST' && url === '/stores-csv') {
    try {
      await uploadCsv(request);
    } catch (err) {
      console.error('Failed to upload CSV', err);

      response.statusCode = 500;
      response.write(JSON.stringify({ error: '500', message: '500 Server error' }));
      response.end();
      return;
    }
    response.write(JSON.stringify({ status: '200 OK' }));
    response.end();
    return;
  }

  notFound(response);
}

module.exports = { handleRoutes, handleStreamRoutes };
