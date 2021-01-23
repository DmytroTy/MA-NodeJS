exports.up = async (knex) => {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.string('username').notNullable();
    table.string('password').notNullable();
    table.timestamp('deleted_at').nullable();
    table.timestamps();
    table.unique('username', 'users_username_unk');
  });

  await knex.schema.createTable('refreshSessions', (table) => {
    table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.uuid('user_id').notNullable();
    table.string('refresh_token', 36).notNullable();
    /* table.string('user_agent').notNullable();
    table.string('fingerprint').notNullable();
    table.string('ip').notNullable(); */
    table.bigInteger('expires_in').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.foreign('user_id', 'refreshSessions_fk0').references('users.id');
  });
};

exports.down = async (knex) => {
  await knex.schema.table('refreshSessions', (table) => {
    table.dropForeign('user_id', 'refreshSessions_fk0');
  });
  await knex.schema.dropTable('refreshSessions');
  await knex.schema.dropTable('users');
};
