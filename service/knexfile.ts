import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const connection = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'booking_user',
  password: process.env.DB_PASSWORD || 'booking_password',
  database: process.env.DB_NAME     || 'booking_platform',
  multipleStatements: true,
};

const migrations: Knex.MigratorConfig = {
  directory:  './src/database/knex-migrations',
  extension:  'ts',
  tableName:  'knex_migrations',
};

const config: Knex.Config = {
  client: 'mysql2',
  connection,
  migrations,
  pool: { min: 2, max: 10 },
};

export default config;
