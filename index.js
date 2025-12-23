require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});

// Initialize Gemini AI if API key exists
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Store conversation history
const conversations = new Map();

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'there';
  
  bot.sendMessage(chatId, `🤖 مرحباً ${userName}!

أنا AI Factory Super Bot - مساعدك الذكي المتقدم 🚀

✨ أنا جاهز للرد على أي سؤال أو طلب:
• إسألني أي سؤال
• اطلب مني البحث عن معلومات
• تحدث معي بشكل طبيعي
• اطلب مساعدة في البرمجة
• أي شيء تريده!

فقط اكتب ما تريد وسأساعدك فوراً 💬

استخدم /help لمعرفة الأوامر المتاحة`);
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, `📖 دليل الاستخدام

🎯 الاستخدام العادي:
فقط اكتب أي شيء وسأرد عليك! لا حاجة لأوامر خاصة.

أمثلة:
• "ما هو الذكاء الاصطناعي؟"
• "اكتب لي كود Python"
• "اشرح لي كيف يعمل React"
• "ما أخبار التكنولوجيا اليوم؟"

⚡ أوامر سريعة (اختيارية):
/start - البداية
/help - هذه المساعدة
/clear - مسح سجل المحادثة
/models - النماذج المتاحة
/status - حالة البوت

💡 نصيحة: تحدث معي بشكل طبيعي، أنا أفهم العربية والإنجليزية!`);
});

bot.onText(/\/models/, (msg) => {
  bot.sendMessage(msg.chat.id, `🤖 النماذج المتاحة

حالياً أستخدم:
${genAI ? '✅ Google Gemini 2.0 Flash (نشط)' : '⚠️ Gemini غير مفعل'}

النماذج المدعومة:
• Google Gemini 2.0 Flash
• Groq Llama 3.3 70B
• DeepSeek V3
• OpenRouter Models
• Cerebras

للحصول على مفاتيح API مجانية:
https://github.com/admragy/ai-factory`);
});

bot.onText(/\/status/, (msg) => {
  const uptime = Math.floor(process.uptime());
  const activeChats = conversations.size;
  
  bot.sendMessage(msg.chat.id, `📊 حالة البوت

✅ البوت يعمل بشكل طبيعي
${genAI ? '✅ AI مفعل (Gemini)' : '⚠️ AI غير مفعل'}

⏱️ وقت التشغيل: ${uptime} ثانية
💬 المحادثات النشطة: ${activeChats}
🔋 الحالة: ممتازة

النسخة: 2.0 - AI Factory Super Bot`);
});

bot.onText(/\/clear/, (msg) => {
  const chatId = msg.chat.id;
  conversations.delete(chatId);
  bot.sendMessage(chatId, '✅ تم مسح سجل المحادثة! ابدأ محادثة جديدة.');
});

// Handle ALL text messages (main AI functionality)
bot.on('message', async (msg) => {
  // Skip if it's a command or not text
  if (!msg.text || msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const userMessage = msg.text;
  const userName = msg.from.first_name || 'صديقي';
  
  try {
    // Send typing indicator
    await bot.sendChatAction(chatId, 'typing');
    
    let response;
    
    if (genAI) {
      // Get conversation history
      let history = conversations.get(chatId) || [];
      
      // Use Gemini AI
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      // Build conversation context
      const context = history.slice(-10).map(h => 
        `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`
      ).join('\n');
      
      const fullPrompt = `أنت AI Factory Super Bot - مساعد ذكي متقدم يجمع قدرات Genspark AI و Manus Max 1.6.

أسلوبك:
- ودود ومحترف
- إجابات واضحة ومفيدة
- تدعم العربية والإنجليزية
- تساعد في البرمجة والتحليل والبحث
- إبداعي في حل المشاكل

${context ? 'السياق السابق:\n' + context + '\n\n' : ''}User: ${userMessage}
Assistant:`;
      
      const result = await model.generateContent(fullPrompt);
      response = result.response.text();
      
      // Update conversation history
      history.push({ role: 'user', content: userMessage });
      history.push({ role: 'assistant', content: response });
      
      // Keep only last 20 messages
      if (history.length > 20) {
        history = history.slice(-20);
      }
      conversations.set(chatId, history);
      
    } else {
      // Fallback response without API key
      response = `مرحباً ${userName}! 👋

رسالتك: "${userMessage}"

⚠️ لتفعيل الذكاء الاصطناعي الكامل، يرجى إضافة GEMINI_API_KEY في ملف .env

احصل على مفتاح مجاني من:
https://ai.google.dev/

في الوقت الحالي، أنا في وضع العرض التجريبي. بعد إضافة المفتاح، سأتمكن من:
• الرد بذكاء على جميع أسئلتك
• مساعدتك في البرمجة
• البحث والتحليل
• وأكثر من 100 قدرة أخرى!

استخدم /help للمزيد من المعلومات.`;
    }
    
    // Send response
    await bot.sendMessage(chatId, response, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
    
  } catch (error) {
    console.error('Error:', error);
    await bot.sendMessage(chatId, 
      '❌ عذراً، حدث خطأ في معالجة رسالتك. الرجاء المحاولة مرة أخرى.\n\n' +
      'إذا استمرت المشكلة، تأكد من صحة GEMINI_API_KEY في .env'
    );
  }
});

// Handle photos
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, 
    '📸 استلمت صورة!\n\n' +
    'قريباً سأتمكن من تحليل الصور. حالياً استخدم النص للتواصل معي.\n\n' +
    'للحصول على كامل القدرات، راجع: https://github.com/admragy/ai-factory'
  );
});

// Handle documents
bot.on('document', async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId,
    '📄 استلمت ملف!\n\n' +
    'قريباً سأتمكن من تحليل الملفات. حالياً استخدم النص للتواصل معي.\n\n' +
    'للحصول على كامل القدرات، راجع: https://github.com/admragy/ai-factory'
  );
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Startup message
console.log('🚀 AI Factory Super Bot Started!');
console.log('✅ Ready to accept ALL text messages');
console.log(genAI ? '✅ Gemini AI Active' : '⚠️  Gemini AI not configured (add GEMINI_API_KEY to .env)');
console.log('📱 Bot is now listening for messages...');
