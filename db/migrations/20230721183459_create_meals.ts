import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.uuid('user_id').index().references('id').inTable('users')
    table.string('name').notNullable()
    table.text('description').notNullable()
    table.enum('type', ['on_diet', 'off_diet']).notNullable()
    table.timestamp('time').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
