// ==========================================================
// ELITE RESULTS BOT — Telegramga natijalarni chiroyli yuborish
// ==========================================================
// Bu server Elite Test platformasi bilan ishlaydi:
// Sayt natijalarni shu serverga yuboradi -> server Telegramga chiroyli
// formatda xabar + qizil "Natijalar bilan tanishing" tugmasini yuboradi.
//
// MUHIM: Bot tokeni endi saytda (brauzerda) emas, shu yerda — xavfsizroq!

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '2mb' }));

// ---------- SOZLAMALAR (Render "Environment" bo'limidan keladi) ----------
const BOT_TOKEN = process.env.BOT_TOKEN;       // BotFather bergan token
const CHAT_ID = process.env.CHAT_ID;           // Natijalar yuboriladigan chat ID
const API_KEY = process.env.API_KEY;           // Saytdan kelgan so'rovni tasdiqlash uchun maxfiy kalit
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*'; // Saytingiz manzili (masalan https://sizniki.netlify.app)

app.use(cors({ origin: ALLOWED_ORIGIN }));

if (!BOT_TOKEN || !CHAT_ID || !API_KEY) {
  console.warn('⚠️  DIQQAT: BOT_TOKEN, CHAT_ID yoki API_KEY environment variable sozlanmagan!');
}

const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ---------- Yordamchi funksiyalar ----------

// HTML parse_mode uchun maxsus belgilarni xavfsiz qilish
function escHtml(s) {
  return String(s == null ? '' : s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
}

// Telegram Premium maxsus emoji (custom_emoji) — HTML <tg-emoji> tegi orqali
// Eslatma: bu faqat bot egasi (siz) Telegram Premium bo'lsa ko'rinadi,
// aks holda oddiy fallback emoji ko'rinadi — xato chiqmaydi.
function ce(emoji, id) {
  return `<tg-emoji emoji-id="${id}">${emoji}</tg-emoji>`;
}
const CE_TROPHY = ce('🏆', '5422716620055257339');
const CE_ID = ce('🆔', '5363858422590619939');
const CE_GOLD = ce('🥇', '5440539497383087970');
const CE_SILVER = ce('🥈', '5447203607294265305');
const CE_BRONZE = ce('🥉', '5453902265922376865');
const CE_CHART = ce('📊', '5364265190353286344');
const CE_CLOCK = ce('🕒', '5321284095412553281');
const CLOCK_EMOJI_ID = '5321284095412553281';

async function sendMessage(text, extra = {}) {
  const res = await fetch(`${TG_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML', ...extra })
  });
  const data = await res.json();
  if (!data.ok) console.error('Telegram xatosi:', data);
  return data;
}

const MODE_NAMES = {
  mock: 'Mock Test',
  kalitli: 'Kalitli Test',
  yakuniy: 'Yakuniy Test',
  dtm: 'DTM Test'
};

// ---------- Asosiy endpoint: natijalarni yuborish ----------
app.post('/send-results', async (req, res) => {
  try {
    // Xavfsizlik: maxfiy kalitni tekshirish
    if (req.headers['x-api-key'] !== API_KEY) {
      return res.status(401).json({ ok: false, error: 'Ruxsat etilmagan (noto\'g\'ri API kalit)' });
    }

    const { mode, testId, rows, siteUrl } = req.body;
    if (!mode || !testId || !Array.isArray(rows)) {
      return res.status(400).json({ ok: false, error: 'mode, testId va rows majburiy' });
    }
    if (!rows.length) {
      return res.status(400).json({ ok: false, error: 'Natijalar ro\'yxati bo\'sh' });
    }

    const modeName = MODE_NAMES[mode] || mode.toUpperCase();
    const sorted = [...rows].sort((a, b) => (b.score || 0) - (a.score || 0));
    const sep = '━'.repeat(16);

    // Sarlavha
    let message = `${CE_TROPHY} <b>${escHtml(modeName)} NATIJALARI</b>\n`;
    message += `${CE_ID} <b>ID:</b> <code>${escHtml(testId)}</code>\n${sep}\n`;

    // Har bir o'quvchi qatori
    const lines = sorted.map((r, i) => {
      const medal = i === 0 ? CE_GOLD : i === 1 ? CE_SILVER : i === 2 ? CE_BRONZE : `${i + 1}.`;
      const sharif = r.sharif ? ' ' + r.sharif : '';
      const name = escHtml((r.student || '—') + sharif);
      return `${medal} <b>${name}</b> — ${escHtml(r.score || 0)} ball (${escHtml(r.grade || '—')}), ${escHtml(r.correct || 0)} to'g'ri\n`;
    });

    const footer = `${sep}\n${CE_CHART} Jami: <b>${sorted.length}</b> o'quvchi\n${CE_CLOCK} ${escHtml(new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' }))}`;

    // Telegram xabar limiti — 4096 belgi, ehtiyot uchun 3500 da bo'lamiz
    const LIMIT = 3500;
    let chunk = message;
    for (const line of lines) {
      if ((chunk + line).length > LIMIT) {
        await sendMessage(chunk + '\n<i>...davom etadi...</i>');
        chunk = '';
      }
      chunk += line;
    }
    await sendMessage(chunk + footer);

    // 🔴 "Natijalar bilan tanishing" tugmali xabar (Bot API 9.4 — haqiqiy qizil tugma + maxsus emoji)
    if (siteUrl) {
      const resultsUrl = `${siteUrl}?view=results&mode=${encodeURIComponent(mode)}&id=${encodeURIComponent(testId)}`;
      await sendMessage(`${CE_CLOCK} Batafsil natijalarni veb-sahifada ko'rishingiz mumkin:`, {
        reply_markup: {
          inline_keyboard: [[
            { text: '📊 Natijalar bilan tanishing', url: resultsUrl, style: 'danger', icon_custom_emoji_id: CLOCK_EMOJI_ID }
          ]]
        }
      });
    }

    res.json({ ok: true, sent: sorted.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Render "health check" uchun
app.get('/', (req, res) => res.send('✅ Elite Results Bot ishlamoqda'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bot serveri ${PORT}-portda ishga tushdi`));
