import { Pool } from 'pg';

const db = new Pool({
  host: process.env.PG_HOST,
  port: +process.env.PG_PORT!!,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: process.env.PG_SSL === 'true',
  query_timeout: 10000,
  statement_timeout: 10000,
  max: 100,
});

export default db;
