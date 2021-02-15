const request = require('./axiosNovaPoshta');
const { apiKey, refCherkasy } = require('../../config');

const dollarExchangeRate = 28;

const getCities = () =>
  request({
    apiKey,
    modelName: 'Address',
    calledMethod: 'getCities',
  });

const getCity = (cityName) =>
  request({
    apiKey,
    modelName: 'Address',
    calledMethod: 'getCities',
    methodProperties: {
      FindByString: cityName,
    },
  });

const getShippingCost = (cityRecipient, totalWeight, totalPrice) =>
  request({
    apiKey,
    modelName: 'InternetDocument',
    calledMethod: 'getDocumentPrice',
    methodProperties: {
      CitySender: refCherkasy,
      CityRecipient: cityRecipient,
      Weight: totalWeight,
      ServiceType: 'WarehouseDoors',
      Cost: totalPrice * dollarExchangeRate,
      CargoType: 'Cargo',
      SeatsAmount: 1,
      /* PackCalculate: {
        PackCount: 1,
        PackRef: '1499fa4a-d26e-11e1-95e4-0026b97ed48a',
      }, */
      RedeliveryCalculate: {
        CargoType: 'Money',
        Amount: totalPrice * dollarExchangeRate,
      },
    },
  });

module.exports = {
  getCities,
  getCity,
  getShippingCost,
};
