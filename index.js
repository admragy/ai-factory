require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '🤖 AI Factory Super Bot Started!\n\nUse /help for commands.');
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, `
📖 Available Commands:

/start - Start the bot
/help - Show this help
/search <query> - Web search
/image <prompt> - Generate image
/code <code> - Execute code
/models - Show available models
/status - Bot status

For more info: https://github.com/admragy/ai-factory
  `);
});

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  
  bot.sendMessage(msg.chat.id, '🤖 Processing with AI...\n\n' + 
    'This is a demo response. Install dependencies and configure API keys for full functionality.');
});

console.log('✅ Bot started successfully!');
