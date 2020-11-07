const { parse: parseQuery } = require('querystring');
const router = require('./router');

module.exports = async (request, response) => {
  // const { url, method } = request;
  const parsedUrl = new URL(request.url, process.env.ORIGIN);
  const queryParams = parseQuery(parsedUrl.search.slice(1));

  let data = '';

  request
    .on('error', (err) => {
      console.error(err.message);
    })
    .on('data', (chunk) => {
      data += chunk;
    })
    .on('end', () => {
      let body;
      try {
        body = data ? JSON.parse(data) : {};
      } catch (err) {
        console.error(err.message);
      }

      router({ ...request, body, queryParams }, response);
    });
};
