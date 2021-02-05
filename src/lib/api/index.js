const request = require('./axios');
const { apiKey } = require('../../config');

const getSity = (sityName) =>
  request({
    apiKey,
    modelName: 'Address',
    calledMethod: 'getCities',
    methodProperties: {
      FindByString: sityName,
    },
  });

const getShippingCost = (cityRecipient, totalWeight, totalPrice) =>
  request({
    apiKey,
    modelName: 'InternetDocument',
    calledMethod: 'getDocumentPrice',
    methodProperties: {
      CitySender: 'db5c8902-391c-11dd-90d9-001a92567626',
      CityRecipient: cityRecipient,
      Weight: totalWeight,
      ServiceType: 'WarehouseDoors',
      Cost: totalPrice * 28,
      CargoType: 'Cargo',
      SeatsAmount: 1,
      /* PackCalculate: {
        PackCount: 1,
        PackRef: '1499fa4a-d26e-11e1-95e4-0026b97ed48a',
      }, */
      RedeliveryCalculate: {
        CargoType: 'Money',
        Amount: totalPrice * 28,
      },
    },
  });

module.exports = {
  getSity,
  getShippingCost,
};
