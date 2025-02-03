const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 注册
router.post('/register', userController.register);

// 登录
router.post('/login', userController.login);

// 获取收藏列表
router.get('/:userId/favorites', userController.getFavorites);

// 添加收藏
router.post('/favorites', userController.addFavorite);

// 取消收藏
router.delete('/favorites', userController.removeFavorite);

module.exports = router;