# 📋 DEASY — Deutsche Bürokratie. Endlich verständlich.

KI-помощник для анализа немецких бюрократических писем + интерактивный чат.

## ✨ Возможности

✅ **Анализ документов** — загрузи письмо, Claude объяснит его
✅ **Интерактивный чат** — задавай вопросы о документе
✅ **Выделение сроков** — красные/жёлтые/зелёные значки срочности
✅ **Пошаговые инструкции** — что делать дальше

## 🚀 Быстрый старт

### 1️⃣ Клонируй репо
```bash
git clone https://github.com/YOUR_USERNAME/deasy-mvp-full.git
cd deasy-mvp-full
```

### 2️⃣ Установи зависимости
```bash
npm install
```

### 3️⃣ Добавь API ключ Anthropic
Создай `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

Получи ключ на https://console.anthropic.com/account/keys

### 4️⃣ Запусти локально
```bash
npm run dev
```

Открой http://localhost:3000

### 5️⃣ Деплой на Vercel
```bash
npm install -g vercel
vercel
```

На Vercel добавь переменную окружения:
- **Название:** `ANTHROPIC_API_KEY`
- **Значение:** твой API ключ
- **Scope:** Production

## 📱 Как использовать

1. **Загрузи письмо** — JPG, PNG, GIF, WEBP (макс. 10 МБ)
2. **Получи анализ** — Claude объяснит, что значит письмо
3. **Задавай вопросы** — чат поможет разобраться
4. **Действуй** — следуй пошаговым инструкциям

## 🏗️ Структура проекта

```
deasy-mvp-full/
├── pages/
│   ├── api/
│   │   ├── analyze.ts    ← Анализ документов (Claude Vision)
│   │   └── chat.ts       ← Чат в контексте документа
│   ├── index.tsx         ← Главная страница
│   ├── datenschutz.tsx   ← Privacy Policy
│   └── impressum.tsx     ← Impressum
├── styles/
│   └── Home.module.css   ← Стили (responsive, чат)
├── public/               ← Статические файлы
├── package.json
└── next.config.js
```

## 🔌 API Endpoints

### POST /api/analyze
Анализирует загруженный документ.

**Request:**
```json
{
  "image": "base64_string",
  "mediaType": "image/jpeg|png|gif|webp"
}
```

**Response:**
```json
{
  "success": true,
  "document_type": "Kindergeldantrag",
  "summary": "...",
  "explanation": "...",
  "urgent_tasks": [
    {
      "task": "Ausfüllen und einreichen",
      "deadline": "30.12.2024",
      "urgency": "high",
      "details": "..."
    }
  ],
  "next_steps": ["Schritt 1.."],
  "confidence": 0.85
}
```

### POST /api/chat
Отвечает на вопросы в контексте документа.

**Request:**
```json
{
  "message": "Что означает эта фраза?",
  "documentAnalysis": "JSON строка анализа",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "reply": "Ответ Claude на немецком..."
}
```

## 💰 Стоимость

- 1 анализ документа ~ $0.003
- 1000 анализов ~ $3
- Чат включен в анализ (дополнительных расходов нет)

## ⚠️ Важно для Германии

- **ДСВО (GDPR):** Документы анализируются через Anthropic API
- **Получи AVV (Auftragsverarbeitungsvertrag):** https://www.anthropic.com/legal/enterprise-agreements
- **Обновь /datenschutz** с реальными контактами
- **Обновь /impressum** согласно § 5 TMG

## 🤝 Конкуренты

- **Klar** — RAG, автозаполнение форм, 6 языков (впереди)
- **buergerchat** — еженедельный краулинг сумм
- **Germany App** — государственное приложение (пилот 1.7.2026)
- **Bureaucracy Buddy** — App Store

## 📝 Лицензия

MIT

## 👨‍💻 Контакты

Ilja Schneider — [GitHub](https://github.com/YOUR_USERNAME)

---

**Сделано с ❤️ для немецкой бюрократии**
