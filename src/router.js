const { good, goodWithMaxCost, standardize } = require('./controller');

function notFound(res) {
  res.statusCode = 404;
  res.write(JSON.stringify({ error: '404' }));
  res.end();
}

module.exports = (request, response) => {
  const { url, method, queryParams, body: data } = request;

  response.setHeader('Content-Type', 'application/json');

  if (method === 'GET' && url.startsWith('/good?')) return good(response, queryParams);
  if (method === 'GET' && url === '/good-with-max-cost') return goodWithMaxCost(response);
  if (method === 'POST' && url === '/standardize') return standardize(data, response);
  return notFound(response);
};
