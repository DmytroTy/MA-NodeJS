exports.up = async (knex) => {
  await knex.schema
    .raw(
      `ALTER TABLE "products"
      ADD CONSTRAINT "products_quantity_check" CHECK("quantity" >= 0)`,
    )
    .table('products', (table) => {
      table.decimal('weight').notNullable().defaultTo(0.5);
    });

  await knex.schema.createTable('orders', (table) => {
    table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.uuid('user_id').notNullable();
    table
      .enu('status', ['openly', 'processed', 'canceled'], {
        useNative: true,
        enumName: 'status_type',
      })
      .notNullable();
    table.timestamp('deleted_at').nullable();
    table.timestamps();
    table.foreign('user_id', 'orders_fk0').references('users.id');
  });

  await knex.schema.createTable('orders_products', (table) => {
    table.uuid('order_id').notNullable();
    table.uuid('product_id').notNullable();
    table.integer('quantity').notNullable().defaultTo(1);
    table.foreign('order_id', 'orders_products_fk0').references('orders.id');
    table.foreign('product_id', 'orders_products_fk1').references('products.id');
    table.primary(['order_id', 'product_id'], 'orders_products_pkey');
  });

  await knex.raw(`ALTER TABLE "orders_products"
    ADD CONSTRAINT "orders_products_quantity_check" CHECK("quantity" > 0)`);
};

exports.down = async (knex) => {
  await knex.schema.table('orders_products', (table) => {
    table.dropForeign('product_id', 'orders_products_fk1');
    table.dropForeign('order_id', 'orders_products_fk0');
  });
  await knex.schema.dropTable('orders_products');

  await knex.schema.table('orders', (table) => {
    table.dropForeign('user_id', 'orders_fk0');
  });
  await knex.schema.dropTable('orders');
  await knex.raw('DROP TYPE "status_type"');

  await knex.schema
    .raw(
      `ALTER TABLE "products"
      DROP CONSTRAINT "products_quantity_check"`,
    )
    .table('products', (table) => {
      table.dropColumn('weight');
    });
};
