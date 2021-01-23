const Knex = require('knex');
const { checkError } = require('../checkError');

const name = 'knex';

module.exports = (config) => {
  const knex = new Knex(config);

  const getID = async (table, value) => {
    const res = await knex(table).select('id').where('name', value).whereNull('deleted_at');
    return res[0] ? res[0].id : null;
  };

  return {
    testConnection: async () => {
      try {
        console.log(`hello from ${name} testConnection`);
        await knex.raw('SELECT NOW();');
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },

    close: async () => {
      console.log(`INFO: Closing ${name} DB wrapper`);
      // no close for knex
    },

    upsertProduct: async ({ type, color, price = 0, quantity = 0 }) => {
      try {
        if (!type) {
          throw new Error('ERROR: No product type defined');
        }
        if (!color) {
          throw new Error('ERROR: No product color defined');
        }
        const timestamp = new Date();
        /* const p = JSON.parse(JSON.stringify(product));

        delete p.id;
        p.price = p.price || 0;
        p.quantity = p.quantity || 0;
        p.created_at = timestamp;
        p.updated_at = timestamp; */

        const p = {
          type_id: await getID('types', type),
          color_id: await getID('colors', color),
          price,
          quantity,
          created_at: timestamp,
          updated_at: timestamp,
        };

        const res = await knex('products')
          .insert(p)
          .onConflict(['type_id', 'color_id', 'price'])
          .merge({
            updated_at: timestamp,
            deleted_at: null,
            quantity: await (async () => {
              const old = await knex('products')
                .select('quantity', 'deleted_at')
                .where({ type_id: p.type_id, color_id: p.color_id, price });

              if (!old[0]) return 0;
              return old[0].deleted_at ? p.quantity : old[0].quantity + p.quantity;
            })(),
          })
          .returning([
            'id',
            'type_id',
            'color_id',
            'price',
            'quantity',
            'created_at',
            'updated_at',
          ]);

        console.log(`DEBUG: New product created or updated: ${JSON.stringify(res[0])}`);
        return res[0];
      } catch (err) {
        console.error(err.message || err);
        throw checkError(err);
      }
    },

    getProduct: async (id) => {
      try {
        if (!id) {
          throw new Error('ERROR: No product id defined');
        }
        const res = await knex('products')
          .column(
            'products.id',
            { type: 'types.name' },
            { color: 'colors.name' },
            'products.price',
            'products.quantity',
            'products.created_at',
            'products.updated_at',
          )
          .select()
          .join('types', 'types.id', '=', 'products.type_id')
          .join('colors', 'colors.id', '=', 'products.color_id')
          .where('products.id', id)
          .whereNull('products.deleted_at');

        return res[0];
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },

    getAllProducts: async () => {
      try {
        const res = await knex('products')
          .column(
            'products.id',
            { type: 'types.name' },
            { color: 'colors.name' },
            'products.price',
            'products.quantity',
            'products.created_at',
            'products.updated_at',
          )
          .select()
          .join('types', 'types.id', '=', 'products.type_id')
          .join('colors', 'colors.id', '=', 'products.color_id')
          .whereNull('products.deleted_at');

        return res;
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

        if (!Object.keys(product).length) {
          throw new Error('ERROR: Nothing to update');
        }

        product.updated_at = new Date();
        if (product.type) {
          product.type_id = await getID('types', product.type);
          delete product.type;
        }
        if (product.color) {
          product.color_id = await getID('colors', product.color);
          delete product.color;
        }

        const res = await knex('products')
          .update(product)
          .where('id', id)
          .whereNull('deleted_at')
          .returning([
            'id',
            'type_id',
            'color_id',
            'price',
            'quantity',
            'created_at',
            'updated_at',
          ]);

        console.log(`DEBUG: Product updated: ${JSON.stringify(res[0])}`);
        return res[0];
      } catch (err) {
        console.error(err.message || err);
        throw checkError(err);
      }
    },

    deleteProduct: async (id) => {
      try {
        if (!id) {
          throw new Error('ERROR: No product id defined');
        }
        // await knex('products').where('id', id).del();
        await knex('products').update('deleted_at', new Date()).where('id', id);

        return true;
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },

    createUser: async ({ username, password }) => {
      try {
        if (!username) {
          throw new Error('ERROR: No user username defined');
        }
        if (!password) {
          throw new Error('ERROR: No user password defined');
        }
        const timestamp = new Date();

        const user = {
          username,
          password,
          created_at: timestamp,
          updated_at: timestamp,
        };

        const res = await knex('users')
          .insert(user)
          .returning(['id', 'username', 'password', 'created_at', 'updated_at']);

        console.log(`DEBUG: New user created: ${JSON.stringify(res[0])}`);
        return res[0];
      } catch (err) {
        console.error(err.message || err);
        throw checkError(err);
      }
    },

    getUser: async (username) => {
      try {
        if (!username) {
          throw new Error('ERROR: No user username defined');
        }
        const res = await knex('users')
          .select('id', 'username', 'password', 'created_at', 'updated_at')
          .where('username', username)
          .whereNull('deleted_at');

        return res[0];
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },

    updateUser: async ({ id, ...user }) => {
      try {
        if (!id) {
          throw new Error('ERROR: No user id defined');
        }

        if (!Object.keys(user).length) {
          throw new Error('ERROR: Nothing to update');
        }

        user.updated_at = new Date();

        const res = await knex('users')
          .update(user)
          .where('id', id)
          .whereNull('deleted_at')
          .returning(['id', 'username', 'password', 'created_at', 'updated_at']);

        console.log(`DEBUG: User updated: ${JSON.stringify(res[0])}`);
        return res[0];
      } catch (err) {
        console.error(err.message || err);
        throw checkError(err);
      }
    },

    deleteUser: async (id) => {
      try {
        if (!id) {
          throw new Error('ERROR: No user id defined');
        }
        // await knex('users').where('id', id).del();
        await knex('users').update('deleted_at', new Date()).where('id', id);

        return true;
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },

    createSession: async (session) => {
      try {
        session.created_at = new Date();

        const res = await knex('refreshSessions').insert(session).returning('*');

        return res[0];
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },

    getSession: async (refreshToken) => {
      try {
        if (!refreshToken) {
          throw new Error('ERROR: No session refreshToken defined');
        }
        const res = await knex('refreshSessions').where('refresh_token', refreshToken);

        return res[0];
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },

    updateSession: async ({ id, ...session }) => {
      try {
        if (!id) {
          throw new Error('ERROR: No session id defined');
        }

        if (!Object.keys(session).length) {
          throw new Error('ERROR: Nothing to update');
        }

        const res = await knex('refreshSessions').update(session).where('id', id).returning('*');

        return res[0];
      } catch (err) {
        console.error(err.message || err);
        throw checkError(err);
      }
    },

    deleteSession: async (refreshToken) => {
      try {
        if (!refreshToken) {
          throw new Error('ERROR: No session refreshToken defined');
        }
        await knex('refreshSessions').where('refresh_token', refreshToken).del();

        return true;
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },
  };
};
