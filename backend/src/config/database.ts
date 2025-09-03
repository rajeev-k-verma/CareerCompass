import knex, { Knex } from 'knex';
import { config } from './environment';

// Database configuration
const databaseConfig: Knex.Config = {
  client: 'postgresql',
  connection: config.database.url || {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
  debug: config.nodeEnv === 'development',
};

// Create database instance
export const database = knex(databaseConfig);

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    await database.raw('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeConnection(): Promise<void> {
  await database.destroy();
}
