
const pool = require("./db");

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'General',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("Notes table created successfully!");
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

initializeDatabase();
