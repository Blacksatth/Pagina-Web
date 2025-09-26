import mysql from 'mysql2/promise';

export async function connectToDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      },
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
    });

    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}