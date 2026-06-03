import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE invitations
      ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT '',
      ADD COLUMN last_name VARCHAR(100);

    ALTER TABLE invitations
      ALTER COLUMN first_name DROP DEFAULT;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE invitations
      DROP COLUMN IF EXISTS last_name,
      DROP COLUMN IF EXISTS first_name;
  `);
}
