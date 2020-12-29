/* eslint-disable no-unused-vars */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('create extension if not exists "uuid-ossp"');

    await queryInterface.createTable('types', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      updatedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      deletedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });
    await queryInterface.addConstraint('types', {
      fields: ['name'],
      type: 'unique',
      name: 'types_name_unk',
    });

    await queryInterface.createTable('colors', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      updatedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      deletedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });
    await queryInterface.addConstraint('colors', {
      fields: ['name'],
      type: 'unique',
      name: 'colors_name_unk',
    });

    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      type_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'types',
          key: 'id',
        },
      },
      color_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'colors',
          key: 'id',
        },
      },
      price: {
        type: Sequelize.DataTypes.DECIMAL,
        allowNull: false,
        defaultValue: 0.0,
      },
      quantity: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      createdAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      updatedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      deletedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });
    await queryInterface.addConstraint('products', {
      fields: ['type_id', 'color_id', 'price'],
      type: 'unique',
      name: 'products_product_unk',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('products');
    await queryInterface.dropTable('colors');
    await queryInterface.dropTable('types');

    await queryInterface.sequelize.query('drop extension if exists "uuid-ossp"');
  },
};
