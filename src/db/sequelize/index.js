const { readdirSync } = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const modelsDir = path.join(__dirname, './models');

const name = 'sequelize';

module.exports = (config) => {
  const sequelize = new Sequelize(config);
  const db = {};

  readdirSync(modelsDir)
    .filter((file) => {
      return file.indexOf('.') !== 0 && file.slice(-3) === '.js';
    })
    .forEach((file) => {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const model = require(path.join(modelsDir, file))(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    });

  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  const getTypeID = async (type) => {
    const res = await db.type.findOne({
      where: {
        name: type,
        deletedAt: { [Sequelize.Op.is]: null },
      },
    });
    return res ? res.id : null;
  };

  const getColorID = async (color) => {
    const res = await db.color.findOne({
      where: {
        name: color,
        deletedAt: { [Sequelize.Op.is]: null },
      },
    });
    return res ? res.id : null;
  };

  return {
    testConnection: async () => {
      try {
        console.log(`hello from ${name} testConnection`);
        await sequelize.authenticate();
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },

    close: async () => {
      console.log(`INFO: Closing ${name} DB wrapper`);
      return sequelize.close();
    },

    upsertProduct: async ({ type, color, price = 0, quantity = 0 }) => {
      try {
        if (!type) {
          throw new Error('ERROR: No product type defined');
        }
        if (!color) {
          throw new Error('ERROR: No product color defined');
        }
        const timestamp = Date.now();
        /* const p = JSON.parse(JSON.stringify(product));

        delete p.id;
        p.price = p.price || 0;
        p.quantity = p.quantity || 0;
        p.created_at = timestamp;
        p.updated_at = timestamp; */

        const p = {
          type_id: await getTypeID(type),
          color_id: await getColorID(color),
          price,
          quantity,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        const old = await db.product.findOne({
          where: {
            type_id: p.type_id,
            color_id: p.color_id,
            price,
          },
        });

        let res;
        if (!old) {
          res = await db.product.create(p);

          console.log(`DEBUG: New product created: ${JSON.stringify(res)}`);
          return res;
        }

        if (old.deletedAt) p.deletedAt = null;
        else p.quantity = old.quantity + p.quantity;

        res = await db.product.update(p, { where: { id: old.id }, returning: true });

        console.log(`DEBUG: Product updated: ${JSON.stringify(res[1][0])}`);
        return res[1][0];
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
        const res = await db.product.findOne({
          where: {
            id,
            deletedAt: { [Sequelize.Op.is]: null },
          },
        });

        return res;
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },

    getAllProducts: async () => {
      try {
        const res = await db.product.findAll({
          where: {
            deletedAt: { [Sequelize.Op.is]: null },
          },
        });

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

        product.updatedAt = new Date();
        if (product.type) {
          product.type_id = await getTypeID(product.type);
          delete product.type;
        }
        if (product.color) {
          product.color_id = await getColorID(product.color);
          delete product.color;
        }

        const res = await db.product.update(product, { where: { id }, returning: true });

        console.log(`DEBUG: Product updated: ${JSON.stringify(res[1][0])}`);
        return res[1][0];
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
        // await db.product.destroy({ where: { id } });
        await db.product.update({ deletedAt: Date.now() }, { where: { id } });

        return true;
      } catch (err) {
        console.error(err.message || err);
        throw err;
      }
    },
  };
};
