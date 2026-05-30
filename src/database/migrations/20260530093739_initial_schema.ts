import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_name VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT,
        role VARCHAR(50) NOT NULL,
        parent_user_id UUID REFERENCES users(id),
        super_admin_id UUID REFERENCES users(id),
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE
            REFERENCES users(id)
            ON DELETE CASCADE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        phone VARCHAR(30),
        avatar JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE artists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE
            REFERENCES users(id)
            ON DELETE CASCADE,
        manager_id UUID NOT NULL
            REFERENCES users(id)
            ON DELETE RESTRICT,
        stage_name VARCHAR(255) NOT NULL,
        dob DATE,
        gender VARCHAR(50),
        address TEXT,
        first_release_year INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE albums (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        artist_id UUID NOT NULL
            REFERENCES artists(id)
            ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        cover_image JSONB,
        release_date DATE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE musics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        artist_id UUID NOT NULL
            REFERENCES artists(id)
            ON DELETE CASCADE,
        album_id UUID
            REFERENCES albums(id)
            ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        genre VARCHAR(100),
        language VARCHAR(100),
        release_date DATE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        invited_by UUID NOT NULL
            REFERENCES users(id)
            ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        expires_at TIMESTAMP NOT NULL,
        accepted_at TIMESTAMP NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE IF EXISTS invitations CASCADE;
    DROP TABLE IF EXISTS musics CASCADE;
    DROP TABLE IF EXISTS albums CASCADE;
    DROP TABLE IF EXISTS artists CASCADE;
    DROP TABLE IF EXISTS profiles CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
}
