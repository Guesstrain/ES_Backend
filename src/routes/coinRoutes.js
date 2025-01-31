const express = require('express');
const router = express.Router();
const coinController = require('../controllers/coinController');

// Get top meme coins
router.get('/meme', coinController.getTopMemeCoins);

// Get AI analyzed coins
router.get('/analysis', coinController.getAnalyzedCoins);

module.exports = router; 