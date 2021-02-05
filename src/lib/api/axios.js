const axios = require('axios');

module.exports = (data) =>
  axios.request({
    method: 'post',
    url: 'https://api.novaposhta.ua/v2.0/json/',
    data,
  });
