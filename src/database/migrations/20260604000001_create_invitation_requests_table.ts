import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE invitation_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100),
      email VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE IF EXISTS invitation_requests CASCADE;
  `);
}
