import knex from "knex";
import config from "./knexfile";
import { ENV } from "../constants";

const environment = ENV.NODE_ENV || "development";
const dbConfig = config[environment];

export const db = knex(dbConfig);
