import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE artists ALTER COLUMN manager_id DROP NOT NULL;
    ALTER TABLE artists DROP CONSTRAINT IF EXISTS artists_manager_id_foreign;
    ALTER TABLE artists ADD CONSTRAINT artists_manager_id_foreign 
      FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    ALTER TABLE artists DROP CONSTRAINT IF EXISTS artists_manager_id_foreign;
    ALTER TABLE artists ADD CONSTRAINT artists_manager_id_foreign 
      FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE RESTRICT;
    ALTER TABLE artists ALTER COLUMN manager_id SET NOT NULL;
  `);
}
