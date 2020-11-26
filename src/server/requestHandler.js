const { parse: parseQuery } = require('querystring');
const { handleRoutes, handleStreamRoutes } = require('./router');

module.exports = async (request, response) => {
  const parsedUrl = new URL(request.url, process.env.ORIGIN);
  const queryParams = parseQuery(parsedUrl.search.slice(1));

  if (request.headers['content-type'] === 'application/gzip') {
    handleStreamRoutes(request, response).catch((err) => console.error('CSV handler failed', err));
    return;
  }

  const bodyChunks = [];

  request
    .on('error', (err) => {
      console.error(err.message);
    })
    .on('data', (chunk) => {
      bodyChunks.push(chunk);
    })
    .on('end', () => {
      let body = Buffer.concat(bodyChunks).toString();
      try {
        body = body ? JSON.parse(body) : {};
      } catch (err) {
        console.error(err.message);
      }

      const customRequest = { ...request, body, queryParams };
      handleRoutes(customRequest, response);
    });
};
