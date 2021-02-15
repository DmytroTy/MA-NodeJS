const db = require('../../db');
const { getCity, getShippingCost } = require('../../lib/apiNovaPoshta');

async function calculateShippingCost(id, cityName, res) {
  const { data: resp } = await getCity(cityName);
  if (!resp.success || !resp.data[0] || !resp.data[0].Ref) {
    res.status(406).json({ error: '406', message: '406 Incorrect city name received!' });
    return;
  }

  const cityRecipient = resp.data[0].Ref;

  const { goods } = await db.getOrder(id);

  let totalPrice = 0;
  let totalWeight = 0;
  goods.forEach((product) => {
    totalPrice += product.price * product.quantity;
    totalWeight += product.weight * product.quantity;
  });

  const {
    data: {
      data: [shippingCost],
    },
  } = await getShippingCost(cityRecipient, totalWeight, totalPrice);

  res.json({ success: true, shippingCost: shippingCost.Cost + shippingCost.CostRedelivery });
}

module.exports = {
  calculateShippingCost,
};
