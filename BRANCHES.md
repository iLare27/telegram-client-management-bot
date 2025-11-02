# 🌳 Структура веток проекта

## Ветки репозитория

### 🔹 `main` - VPS/Local версия (Long Polling + SQLite)

**Для чего:** Локальная разработка, VPS, любой сервер с постоянным процессом

**Технологии:**
- ✅ Long Polling (bot.start())
- ✅ SQLite (локальная файловая БД)
- ✅ TypeORM
- ✅ Singleton repository pattern
- ✅ Оптимизированные middleware

**Запуск:**
```bash
git checkout main
npm install
npm run dev
```

**Деплой:** VPS, Railway, Fly.io, DigitalOcean, Hetzner

**Плюсы:**
- 🚀 Простой запуск
- 💾 Локальная БД (нет внешних зависимостей)
- 🔄 Постоянное соединение
- 🐛 Легче отлаживать

**Минусы:**
- 📍 Нужен постоянно работающий сервер
- 🔧 Ручное управление процессом

---

### 🔸 `vercel` - Vercel версия (Webhooks + Postgres)

**Для чего:** Serverless деплой на Vercel

**Технологии:**
- ✅ Webhooks (serverless function)
- ✅ Vercel Postgres
- ✅ Auto-scaling
- ✅ Edge functions

**Запуск локально (для тестирования):**
```bash
git checkout vercel
npm install
vercel dev
```

**Деплой:** Vercel (через GitHub integration)

**Плюсы:**
- ☁️ Serverless (нет сервера для управления)
- 📈 Auto-scaling
- 💰 Free tier (или почти бесплатно)
- 🌍 Global CDN

**Минусы:**
- 🔌 Нужна настройка webhook
- 💾 Нужна внешняя БД (Postgres)
- ⏱️ Cold start задержки

---

## 📊 Сравнение веток

| Аспект | `main` | `vercel` |
|--------|--------|----------|
| **Режим** | Long Polling | Webhooks |
| **База данных** | SQLite | Vercel Postgres |
| **Хостинг** | VPS/Railway/Fly.io | Vercel |
| **Стоимость** | $5-10/мес | Free/$0-5/мес |
| **Масштабирование** | Ручное | Автоматическое |
| **Файлы handlers** | `src/handlers/*.ts` | `src/handlers/*-vercel.ts` |
| **Entry point** | `src/index.ts` | `api/webhook.ts` |
| **Запуск** | `npm run dev` | Автоматически |

---

## 🔄 Переключение между ветками

### Перейти на main (VPS версию):
```bash
git checkout main
npm install
npm run dev
```

### Перейти на vercel (Serverless версию):
```bash
git checkout vercel
npm install

# Локальное тестирование
vercel dev

# Или деплой
vercel
```

---

## 📝 Обновление обеих веток

### Если изменили общую логику (messages, config):

1. **Измените в main:**
```bash
git checkout main
# ... внесите изменения ...
git add .
git commit -m "fix: Update messages"
git push
```

2. **Мердж в vercel:**
```bash
git checkout vercel
git merge main
# Решите конфликты если есть
git push
```

### Если изменили специфичную логику:

**Только для VPS (main):**
```bash
git checkout main
# ... изменения в src/handlers/start.ts ...
git add .
git commit -m "feat: Add VPS-specific feature"
git push
```

**Только для Vercel:**
```bash
git checkout vercel
# ... изменения в src/handlers/start-vercel.ts ...
git add .
git commit -m "feat: Add Vercel-specific feature"
git push
```

---

## 🎯 Какую ветку выбрать?

### Выберите `main` если:
- ✅ У вас есть VPS или сервер
- ✅ Хотите простоту
- ✅ Нужна локальная разработка
- ✅ Не хотите настраивать webhook

### Выберите `vercel` если:
- ✅ Хотите serverless
- ✅ Нужно auto-scaling
- ✅ Минимальные затраты
- ✅ Не хотите управлять сервером

---

## 📚 Документация

### Для `main`:
- [README.md](README.md) - Основная документация
- [QUICK_START.md](QUICK_START.md) - Быстрый старт
- [DEPLOYMENT.md](DEPLOYMENT.md) - Деплой на VPS

### Для `vercel`:
- [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) - Деплой на Vercel
- [README.md](README.md) - Общая документация (применимо к обеим веткам)

---

## 🔗 Полезные ссылки

- **GitHub репозиторий:** https://github.com/iLare27/telegram-client-management-bot
- **Main ветка:** https://github.com/iLare27/telegram-client-management-bot/tree/main
- **Vercel ветка:** https://github.com/iLare27/telegram-client-management-bot/tree/vercel

---

**Текущая ветка:** Проверьте с помощью `git branch`

```bash
git branch
# * vercel  <- вы здесь
#   main
```

