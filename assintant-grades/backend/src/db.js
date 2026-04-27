import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

function boolFromEnv(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue;
  return String(value).toLowerCase() === 'true';
}

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  server: process.env.DB_SERVER || 'localhost',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: boolFromEnv(process.env.DB_ENCRYPT, false),
    trustServerCertificate: boolFromEnv(process.env.DB_TRUST_SERVER_CERTIFICATE, true)
  }
};

if (process.env.DB_INSTANCE) {
  sqlConfig.options.instanceName = process.env.DB_INSTANCE;
} else {
  sqlConfig.port = Number(process.env.DB_PORT || 1433);
}

const pool = new sql.ConnectionPool(sqlConfig);
const poolConnect = pool.connect();

pool.on('error', (err) => {
  console.error('[SQL Server Pool Error]', err);
});

export async function getPool() {
  await poolConnect;
  return pool;
}

export { sql };
