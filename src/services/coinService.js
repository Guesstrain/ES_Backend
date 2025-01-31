const axios = require('axios');
const { OpenAI } = require('openai');

class CoinService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.OPENAI_BASE_URL,
        });
    }

    async fetchTopMemeCoins() {
        try {
            const response = await axios.get(process.env.COINGECKO_API_URL, {
                params: {
                    vs_currency: "usd",
                    category: "meme-token",
                    order: "volume_desc",
                    per_page: 100,
                    page: 1,
                    platform: "solana",
                },
            });

            return response.data.map(coin => ({
                name: coin.name,
                symbol: coin.symbol,
                market_cap: coin.market_cap,
                price: coin.current_price,
                volume: coin.total_volume,
                change_24h: coin.price_change_percentage_24h,
            }));
        } catch (error) {
            throw new Error(`Error fetching Solana meme coins: ${error.message}`);
        }
    }

    async rankCoinsWithAI(coins) {
        try {
            const prompt = `分析以下 Meme 币数据，根据投资价值从多个维度进行分析，然后排序。
            
            ${JSON.stringify(coins, null, 2)}

            严格按照以下JSON格式返回结果，不要包含任何其他文字：
            {
                "rankedCoins": [
                    {
                        "name": "币种名称",
                        "symbol": "币种代号",
                        "rank": 数字格式排名,
                        "score": 数字格式评分,
                        "reason": "简要分析原因"
                    }
                ]
            }
            
            注意：
            1. 必须是合法的JSON格式
            2. rank和score必须是数字，不要带引号
            3. 不要在JSON前后添加任何额外文字
            4. 所有字段都必须包含`;

            const response = await this.openai.chat.completions.create({
                model: process.env.MODEL_NAME,
                messages: [{ role: "user", content: prompt }],
                max_tokens: 2048,
                temperature: 0.3,
            });

            // Get the AI response content
            const aiContent = response.choices[0].message.content.trim();
            
            // Try to extract JSON if there's any extra text
            const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in AI response');
            }

            try {
                const aiResponse = JSON.parse(jsonMatch[0]);
                
                // Validate the response structure
                if (!aiResponse.rankedCoins || !Array.isArray(aiResponse.rankedCoins)) {
                    throw new Error('Invalid response structure');
                }

                // Ensure all required fields are present and properly formatted
                const validatedCoins = aiResponse.rankedCoins.map((coin, index) => ({
                    name: coin.name || 'Unknown',
                    symbol: coin.symbol || 'N/A',
                    rank: typeof coin.rank === 'number' ? coin.rank : index + 1,
                    score: typeof coin.score === 'number' ? coin.score : 0,
                    reason: coin.reason || 'No analysis provided'
                }));

                return validatedCoins;
            } catch (parseError) {
                console.error('AI Response:', aiContent);
                throw new Error(`Failed to parse AI response: ${parseError.message}`);
            }
        } catch (error) {
            throw new Error(`Error ranking coins with AI: ${error.message}`);
        }
    }
}

module.exports = new CoinService(); 