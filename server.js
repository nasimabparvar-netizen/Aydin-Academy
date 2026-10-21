
require('dotenv').config();

const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20kb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    aiReady: Boolean(ai)
  });
});

app.post('/api/tutor', async (req, res) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: 'کلید آموزگار هنوز تنظیم نشده است.'
      });
    }

    const question = req.body?.question;

    if (typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({
        error: 'لطفاً پرسش خود را بنویس.'
      });
    }

    if (question.length > 2000) {
      return res.status(400).json({
        error: 'پرسش باید کمتر از ۲۰۰۰ نویسه باشد.'
      });
    }

    const result = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: question.trim(),
      config: {
        systemInstruction:
          'You are Aydin Academy, a friendly English teacher. ' +
          'Help learners understand English grammar, vocabulary, pronunciation, ' +
          'and sentence correction. Explain clearly in Persian when useful, ' +
          'give short English examples, and adapt to beginner learners. ' +
          'Never ask for passwords or secret information.'
      }
    });

    res.json({
      answer: result.text || 'پاسخی دریافت نشد؛ دوباره تلاش کن.'
    });
  } catch (error) {
    console.error('Gemini request failed:', error.message);
    res.status(500).json({
      error: 'پاسخ‌گویی موقتاً انجام نشد. کمی بعد دوباره تلاش کن.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Aydin Academy server: http://localhost:${PORT}`);
});
