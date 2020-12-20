const { Pool } = require('pg');

module.exports = (config) => {
  let client;
  try {
    client = new Pool(config);
  } catch (err) {
    console.error(err.message || err);
    throw err;
  }

  return {
    testConnection: async () => {
      try {
        console.log('hello from pg testConnection');
        await client.query('SELECT NOW()');
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },

    close: async () => {
      console.log('INFO: Closing pg DB wrapper');
      client.end();
    },

    createProduct: async ({ type, color, price = 0, quantity = 0 }) => {
      try {
        if (!type) {
          throw new Error('ERROR: No product type defined');
        }
        if (!color) {
          throw new Error('ERROR: No product color defined');
        }
        const timestamp = new Date();

        const res = await client.query(
          `INSERT INTO products(type, color, price, quantity, created_at, updated_at)
            VALUES($1, $2, $3, $4, $5, $6)
            ON CONFLICT ON CONSTRAINT products_product_unk DO UPDATE
            SET quantity = products.quantity + $4, updated_at = $6
            RETURNING id, type, color, price, quantity, created_at, updated_at`,
          [type, color, price, quantity, timestamp, timestamp],
        );

        console.log(`DEBUG: New product created or updated: ${JSON.stringify(res.rows[0])}`);
        return res.rows[0];
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },

    getProduct: async (id) => {
      try {
        if (!id) {
          throw new Error('ERROR: No product id defined');
        }
        const res = await client.query(
          `SELECT id, type, color, price, quantity, created_at, updated_at
            FROM products WHERE id = $1 AND deleted_at IS NULL`,
          [id],
        );

        return res.rows[0];
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },

    getAllProducts: async () => {
      try {
        const res = await client.query(
          `SELECT id, type, color, price, quantity, created_at, updated_at
            FROM products WHERE deleted_at IS NULL`,
        );

        return res.rows;
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },

    updateProduct: async ({ id, ...product }) => {
      try {
        if (!id) {
          throw new Error('ERROR: No product id defined');
        }

        product.updated_at = new Date();

        const query = [];
        const values = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const [i, [k, v]] of Object.entries(product).entries()) {
          query.push(`${k} = $${i + 1}`);
          values.push(v);
        }

        if (!values.length) {
          throw new Error('ERROR: Nothing to update');
        }

        values.push(id);

        const res = await client.query(
          `UPDATE products SET ${query.join(',')} WHERE id = $${values.length}
            RETURNING id, type, color, price, quantity, created_at, updated_at`,
          values,
        );

        console.log(`DEBUG: Product updated: ${JSON.stringify(res.rows[0])}`);
        return res.rows[0];
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },

    deleteProduct: async (id) => {
      try {
        if (!id) {
          throw new Error('ERROR: No product id defined');
        }
        // await client.query('DELETE FROM products WHERE id = $1', [id]);
        await client.query('UPDATE products SET deleted_at = $1 WHERE id = $2', [new Date(), id]);

        return true;
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },
  };
};