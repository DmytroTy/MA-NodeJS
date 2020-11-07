const { good, goodWithMaxCost, standardize, newData, change } = require('./controller');

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
  if (method === 'GET' && url === '/standardize') return standardize(response);
  if (method === 'GET' && url.startsWith('/change?storage=')) return change(response, queryParams);
  if (method === 'POST' && url === '/new-data') return newData(data, response);
  return notFound(response);
};
