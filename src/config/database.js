const sqlite3 = require('sqlite3').verbose();

// Connect DB
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('❌ Failed to connect database: ', err.message);
    } else {
        console.log('✅ SQLite connected!');
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS Favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            coin_id TEXT NOT NULL,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, coin_id),
            FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE
        )
    `);
});

module.exports = db;