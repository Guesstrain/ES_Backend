const userService = require('../services/userService');

class UserController {
    async register(req, res, next) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({
                    success: false
                });
            }
            await userService.registerUser(username, password);
            res.json({
                success: true,
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({
                    success: false
                });
            }

            const { token, userId } = await userService.loginUser(username, password);
            res.json({
                success: true, token, userId
            });
        } catch (error) {
            next(error);
        }
    }

    async addFavorite(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token)
                return res.status(401).json({ success: false });
            const decoded = await userService.verifyToken(token);
            const { coinId } = req.body;
            if (!coinId)
                return res.status(400).json({ success: false });

            await userService.addFavorite(decoded.userId, coinId);
            res.json({
                success: true
            });
        } catch (error) {
            next(error)
        }
    }

    async getFavorites(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token)
                return res.status(401).json({ success: false });
            const decoded = await userService.verifyToken(token);
            const favorites = await userService.getFavorites(decoded.userId);
            res.json({
                success: true,
                data: favorites
            });
        } catch (error) {
            next(error)
        }
    }

    async removeFavorite(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token)
                return res.status(401).json({ success: false });
            const decoded = await userService.verifyToken(token);
            const { coinId } = req.body;
            if (!coinId)
                return res.status(400).json({
                    success: false
                });

            await userService.removeFavorite(decoded.userId, coinId);
            res.json({
                success: true
            });
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new UserController;