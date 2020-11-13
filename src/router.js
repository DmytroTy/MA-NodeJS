const { good, goodWithMaxCost, standardize, newData } = require('./controller');

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

  if (method === 'GET' && url.startsWith('/good?'))
    return !queryParams.parameter || !queryParams.value
      ? incorrectParameters(response)
      : good(response, queryParams);
  if (method === 'GET' && url === '/good-with-max-cost') return goodWithMaxCost(response);
  if (method === 'GET' && url === '/standardize') return standardize(response);
  if (method === 'POST' && url === '/new-data') return newData(data, response);
  return notFound(response);
};
