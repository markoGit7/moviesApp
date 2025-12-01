//import mysql
import mysql from 'mysql2/promise';

//import env
import "dotenv/config";

export async function connectDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,  
    database: process.env.DB_NAME
  });

  console.log('✅ Connected to MySQL database');
  return connection;
}