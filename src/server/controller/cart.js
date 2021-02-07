const db = require('../../db');
const { getSity, getShippingCost } = require('../../lib/api');

async function calculateShippingCost(id, sityName, res) {
  const { data: resp } = await getSity(sityName);
  if (!resp.success || !resp.data[0] || !resp.data[0].Ref) {
    res.status(406).json({ error: '406', message: '406 Incorrect sity name recived!' });
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
