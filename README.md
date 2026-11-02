# Nihongo Start — Kana va gaplashish trenajeri

O'zbek tilida gapiruvchilar uchun hiragana, katakana va jonli yaponcha gaplashishni o'rganish ilovasi. Bepul, ro'yxatdan o'tishsiz, backendsiz, internetsiz ham ishlaydi (PWA).

## Nimalar bor

- **Kana**: hiragana va katakana jadvali (asosiy harflar, dakuten, yōon), har bir harf uchun eslab qolish usuli, misol so'z, audio va yozilish tartibi animatsiyasi (KanjiVG).
- **Darslar**: qatorma-qator 13 tadan dars (har bir alifbo uchun). Test natijasi 80% dan yuqori bo'lsa, keyingi dars ochiladi.
- **Mashqlar**: kana → romaji, yozib javob berish, romaji → kana, eshitib tanlash, tezlik rejimi, chalkash juftliklar (シ/ツ, ソ/ン, ね/れ/わ…), SRS takrorlash, zaif harflar.
- **Yozish**: canvas'da barmoq yoki sichqoncha bilan yozish, yo'riqnoma va o'zingizni baholash. Qo'lyozmani avtomatik tanish yo'q.
- **Katakana so'zlar**: inglizcha so'zlar katakanaga qanday aylanishi bo'yicha 9 ta qoida va 46 ta ko'p ishlatiladigan so'z.
- **Gapirish**: 13 mavzu bo'yicha 153 ta ibora, rasmiy va do'stona shakllari bilan. 12 ta dialog, rol o'yini, shadowing, ovozni yozib olib solishtirish, ovozni tanish (Chrome/Edge), iboralar uchun SRS kartochkalar.
- **Talaffuz**: o'zbek tilida gapiruvchilar uchun 8 ta dars (r, う, ふ, cho'ziq unlilar, っ, ん, unli tushishi, pitch accent) va juftliklar bo'yicha tinglash testi.
- **Grammatika**: gaplashish uchun zarur bo'lgan 12 ta mavzu va ularning testlari.
- **Bosh sahifa**: kunlik maqsad (10, 20 yoki 30 daqiqa), seriya, haftalik statistika, faollik taqvimi va bugungi reja.
- **Ma'lumotlar**: JSON eksport/import, iboralarni CSV formatida eksport qilish, progressni tasdiq bilan o'chirish.

## GitHub Pages'ga joylash

1. GitHub'da yangi repozitoriy yarating, masalan `nihongo-start`.
2. Shu papkadagi **barcha fayllarni** repozitoriyning ildiziga yuklang (`index.html`, `css/`, `js/`, `manifest.json`, `service-worker.js`, `icon.svg`). Brauzerda: **Add file → Upload files**.
3. **Settings → Pages** bo'limiga o'ting. **Source: Deploy from a branch**, **Branch: main**, papka sifatida **/ (root)** ni tanlang va **Save** tugmasini bosing.
4. 1–2 daqiqadan keyin sayt `https://FOYDALANUVCHI.github.io/nihongo-start/` manzilida ochiladi.
5. Telefonda saytni oching va **«Bosh ekranga qo'shish»** ni tanlang. Shunda ilova kabi ishlaydi va internetsiz ham ochiladi.

Kompyuterda lokal sinash uchun: `python3 -m http.server`, keyin brauzerda `http://localhost:8000` ni oching.

## Fayl tuzilishi

```
index.html            — sahifa skeleti
css/style.css         — dizayn (yorug' va qorong'i mavzu, mobil uchun pastki menyu)
js/strokes-data.js    — yozilish tartibi (KanjiVG)
js/kana-data.js       — kana, mnemonikalar, misollar, katakana so'zlar
js/phrases-data.js    — iboralar va dialoglar
js/lessons-data.js    — talaffuz va grammatika darslari
js/progress.js        — LocalStorage, statistika, seriya
js/srs.js             — intervalli takrorlash (soddalashtirilgan SM-2)
js/audio.js           — nutq sintezi, ovoz yozish, ovozni tanish
js/quiz.js            — test mexanizmi
js/app.js             — marshrutlash va ekranlar
service-worker.js     — oflayn kesh
```

Kontent mantiqdan ajratilgan. Yangi ibora, dialog yoki grammatika darsi qo'shish uchun tegishli `*-data.js` fayliga yangi qator qo'shish kifoya.

## Muhim eslatmalar

- Audio brauzerning **nutq sintezi** orqali ishlaydi. U ona tilida so'zlashuvchi yozuvlari o'rnini bosa olmaydi. Agar qurilmada yaponcha ovoz bo'lmasa, ilova buni aytadi va qanday qo'shishni ko'rsatadi.
- **Ovozni tanish** funksiyasi faqat Chrome yoki Edge'da, internet bilan ishlaydi. Natijadagi foiz taxminiy.
- Mikrofon va fayl yuklab olish faqat alohida sahifada ishlaydi. Boshqa sayt ichiga joylashtirilgan oynada ular bloklanishi mumkin.
- Progress faqat shu brauzerda saqlanadi. Boshqa qurilmaga o'tkazish uchun Sozlamalar → Eksport'dan foydalaning.

## Litsenziya va manbalar

Yozilish tartibi ma'lumotlari [KanjiVG](https://kanjivg.tagaini.net) loyihasidan olingan: © Ulrich Apel, CC BY-SA 3.0.
