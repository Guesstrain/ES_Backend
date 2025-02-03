const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

class UserService {
    async registerUser(username, password) {
        return new Promise(async (resolve, reject) => {
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                db.run(
                    `INSERT INTO Users (username, password) VALUES (?, ?)`,
                    [username, hashedPassword],
                    function (err) {
                        if (err) return reject(err);
                        resolve({ id: this.lastID, username });
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    async loginUser(username, password) {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM Users WHERE Username = ?`, [username], async (err, user) => {
                if (err) return reject(err);
                if (!user)
                    return reject(new Error('User not exist!'));

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch)
                    return reject(new Error('Password error'));

                const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '2h' });
                resolve({ token, userId: user.id, username: user.username });
            });
        });
    }

    async verifyToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, SECRET_KEY, (err, decoded) => {
                if (err)
                    return reject(err);
                resolve(decoded);
            });
        });
    }

    async addFavorite(userId, coinId) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO Favorites (user_id, coin_id) VALUES (?, ?)`,
                [userId, coinId],
                function (err) {
                    if (err) return reject(err);
                    resolve({ id: this.lastID, userId, coinId });
                }
            );
        });
    }

    async getFavorites(userId) {
        return new Promise((resolve, reject) => {
            db.all(`SELECT coin_id FROM Favorites WHERE user_id = ?`, [userId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows.map(row => row.coin_id));
            });
        });
    }

    async removeFavorite(userId, coinId) {
        return new Promise((resolve, reject) => {
            db.run(
                `DELETE FROM Favorites WHERE user_id = ? AND coin_id = ?`,
                [userId, coinId],
                function (err) {
                    if (err) return reject(err);
                    resolve({ message: 'coin removed from favorite', userId, coinId });
                }
            );
        });
    }
}

module.exports = new UserService;