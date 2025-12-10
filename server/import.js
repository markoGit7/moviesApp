import fs from "fs";
import { connectDB } from "./components/dbConnect.js";

const db = await connectDB();

const sqlFilePath = "./movies.sql";
// Load the SQL file
const sql = fs.readFileSync(sqlFilePath, "utf8");

// Split into statements
const statements = sql
  .split(";")
  .map(s => s.trim())
  .filter(s => s.length > 0);

for (const stmt of statements) {
  try {
    console.log("Running:", stmt.substring(0, 40) + "...");
    await db.query(stmt);
  } catch (err) {
    console.error("Error in statement:", stmt);
    console.error(err);
    break;
  }
}

console.log("Import finished!");
process.exit();