import type { Knex } from "knex";
import { ENV } from "../constants";

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: {
      connectionString: ENV.DATABASE_URL,
    },

    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./migrations",
    },
    seeds: {
      directory: "./seeds",
    },
  },

  production: {
    client: "pg",
    connection: {
      connectionString: ENV.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    pool: {
      min: 2,
      max: 20,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./migrations",
    },
  },
};

export default config;
