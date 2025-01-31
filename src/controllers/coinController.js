const coinService = require('../services/coinService');

class CoinController {
    async getTopMemeCoins(req, res, next) {
        try {
            const coins = await coinService.fetchTopMemeCoins();
            res.json({
                success: true,
                data: coins
            });
        } catch (error) {
            next(error);
        }
    }

    async getAnalyzedCoins(req, res, next) {
        try {
            const coins = await coinService.fetchTopMemeCoins();
            const analyzedCoins = await coinService.rankCoinsWithAI(coins);
            
            res.json({
                success: true,
                data: analyzedCoins,
                metadata: {
                    total: analyzedCoins.length,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CoinController(); 