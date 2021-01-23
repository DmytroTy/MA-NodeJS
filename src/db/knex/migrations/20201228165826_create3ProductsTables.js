exports.up = async (knex) => {
  await knex.raw('create extension if not exists "uuid-ossp"');

  await knex.schema.createTable('types', (table) => {
    table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.string('name').notNullable();
    table.timestamp('deleted_at').nullable();
    table.timestamps();
    table.unique('name', 'types_name_unk');
  });

  await knex.schema.createTable('colors', (table) => {
    table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.string('name').notNullable();
    table.timestamp('deleted_at').nullable();
    table.timestamps();
    table.unique('name', 'colors_name_unk');
  });

  await knex.schema.createTable('products', (table) => {
    table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.uuid('type_id').notNullable();
    table.uuid('color_id').notNullable();
    table.decimal('price').notNullable().defaultTo(0.0);
    table.integer('quantity').notNullable().defaultTo(1);
    table.timestamp('deleted_at').nullable();
    table.timestamps();
    table.unique(['type_id', 'color_id', 'price'], 'products_product_unk');
    table.foreign('type_id', 'products_fk0').references('types.id');
    table.foreign('color_id', 'products_fk1').references('colors.id');
  });
};

exports.down = async (knex) => {
  await knex.schema.table('products', (table) => {
    table.dropForeign('color_id', 'products_fk1');
    table.dropForeign('type_id', 'products_fk0');
  });
  await knex.schema.dropTable('products');
  await knex.schema.dropTable('colors');
  await knex.schema.dropTable('types');
  await knex.raw('drop extension if exists "uuid-ossp"');
};
