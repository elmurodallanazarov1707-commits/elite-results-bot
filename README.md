# Elite Results Bot

Elite Test platformasi uchun Telegramga natijalarni chiroyli formatda yuboruvchi bot serveri.

## Nima uchun kerak?

Hozirgi holatda bot tokeni saytning JavaScript kodida ochiq turibdi — buni
istalgan kishi "View Source" orqali ko'rishi mumkin. Bu xavfsiz emas!

Bu server tokenlarni o'zida **maxfiy** saqlaydi, sayt esa faqat natija
ma'lumotlarini shu serverga yuboradi.

## 1-qadam: Render.com'da hisob oching

1. https://render.com ga kiring, GitHub orqali ro'yxatdan o'ting (bepul)

## 2-qadam: Kodni GitHub'ga yuklang

1. GitHub'da yangi repository yarating (masalan `elite-results-bot`)
2. Shu papkadagi barcha fayllarni (`index.js`, `package.json`) shu repога yuklang

## 3-qadam: Render'da Web Service yarating

1. Render dashboard'da **New +** → **Web Service** ni bosing
2. GitHub repongizni tanlang
3. Sozlamalar:
   - **Name:** `elite-results-bot` (yoki istalgan nom)
   - **Region:** Frankfurt (eng yaqin)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

4. **Environment Variables** bo'limida quyidagilarni qo'shing:

   | Key | Value |
   |-----|-------|
   | `BOT_TOKEN` | BotFather bergan tokeningiz |
   | `CHAT_ID` | Natijalar yuboriladigan chat ID |
   | `API_KEY` | O'zingiz o'ylab topgan maxfiy parol (masalan: `elite2026secret`) |
   | `ALLOWED_ORIGIN` | Saytingiz manzili, masalan `https://eloquent-khapse-99d13b.netlify.app` |

5. **Create Web Service** tugmasini bosing, 2-3 daqiqa kuting

6. Deploy tugagach, sizga shunday manzil beriladi:
   ```
   https://elite-results-bot.onrender.com
   ```
   Shu manzilni saqlab qo'ying — saytga ulashda kerak bo'ladi.

## 4-qadam: Tekshirish

Brauzerda bot manzilini oching — `✅ Elite Results Bot ishlamoqda` deb chiqsa, hammasi joyida.

## ⚠️ Eslatma: Render bepul tarifi

Bepul tarifda server 15 daqiqa faolsizlikdan keyin "uxlab qoladi" va birinchi
so'rovga javob berish 30-50 soniya vaqt olishi mumkin. Bu faqat birinchi
so'rov uchun — keyingilari tez ishlaydi. Agar bu muammo bo'lsa, Render'ning
pullik ($7/oy) tarifiga o'tish kerak bo'ladi.
