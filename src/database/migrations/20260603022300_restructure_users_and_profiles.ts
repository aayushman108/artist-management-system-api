import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

    -- Remove old columns from users table
    
    ALTER TABLE users DROP COLUMN IF EXISTS company_name;
    ALTER TABLE users DROP COLUMN IF EXISTS parent_user_id;
    ALTER TABLE users DROP COLUMN IF EXISTS super_admin_id;

    -- Add new columns to users table

    ALTER TABLE users ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
    ALTER TABLE users ADD COLUMN created_by UUID
        REFERENCES users(id)
        ON DELETE SET NULL;

    -- Remove name columns from profiles table

    ALTER TABLE profiles DROP COLUMN IF EXISTS first_name;
    ALTER TABLE profiles DROP COLUMN IF EXISTS last_name;

    -- Add demographic columns to profiles table

    ALTER TABLE profiles ADD COLUMN dob DATE;
    ALTER TABLE profiles ADD COLUMN gender VARCHAR(50);
    ALTER TABLE profiles ADD COLUMN address TEXT;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

    -- Revert profiles table

    ALTER TABLE profiles DROP COLUMN IF EXISTS address;
    ALTER TABLE profiles DROP COLUMN IF EXISTS gender;
    ALTER TABLE profiles DROP COLUMN IF EXISTS dob;

    ALTER TABLE profiles ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT '';
    ALTER TABLE profiles ADD COLUMN last_name VARCHAR(100);
    ALTER TABLE profiles ALTER COLUMN first_name DROP DEFAULT;

    -- Revert users table

    ALTER TABLE users DROP COLUMN IF EXISTS created_by;
    ALTER TABLE users DROP COLUMN IF EXISTS last_name;
    ALTER TABLE users DROP COLUMN IF EXISTS first_name;

    ALTER TABLE users ADD COLUMN super_admin_id UUID REFERENCES users(id);
    ALTER TABLE users ADD COLUMN parent_user_id UUID REFERENCES users(id);
    ALTER TABLE users ADD COLUMN company_name VARCHAR(255);
  `);
}
