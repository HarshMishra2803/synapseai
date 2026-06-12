<div align="center">

# 🧠 SynapseAI — Backend API

**A production-ready REST API for the SynapseAI Second Brain application.**
Built with Express 5, TypeScript, MongoDB Atlas, and JWT authentication.

[![Live API](https://img.shields.io/badge/🔗_Live_API-onrender.com-10b981?style=for-the-badge)](https://synapseai-backend-ocgv.onrender.com/api/v1/health)
[![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render)](https://render.com)
[![Node](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

</div>

---

## ✨ Features

- 🔐 **JWT Authentication** — Stateless auth with token-based sessions
- 📝 **Full CRUD** — Create, Read, Update, Delete content
- 📌 **Pin/Favourite** — Toggle pinned status on content items
- 🤖 **AI Summarization** — Groq (Llama 3.1) + Gemini + local fallback
- 🔗 **Brain Sharing** — Generate unique public share hashes
- 🌍 **CORS Configured** — Allowlist-based with environment variable control
- 🏥 **Health Check** — `/api/v1/health` endpoint for uptime monitoring

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 18+ | JavaScript server runtime |
| **Framework** | Express 5 | HTTP server & routing |
| **Language** | TypeScript 5 | Type safety & better DX |
| **Database** | MongoDB Atlas | NoSQL cloud database |
| **ODM** | Mongoose 9 | MongoDB object modeling |
| **Auth** | JSON Web Tokens (JWT) | Stateless authentication |
| **AI** | Groq API (Llama 3.1) | AI-powered content summarization |
| **Deployment** | Render (Free tier) | Cloud hosting with auto-deploy |

---

## 📁 Project Structure

```
src/
├── index.ts          # Express app, all route definitions, server start
├── db.ts             # Mongoose connection + all schema/model definitions
├── middleware.ts     # JWT authentication middleware (userMiddleware)
└── config.ts         # Environment variable exports (JWT_PASSWORD)
```

---

## 🔌 API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/signup` | ❌ | Create new user account |
| `POST` | `/api/v1/signin` | ❌ | Login and receive JWT token |

### Content

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/content` | ✅ | Get all content for authenticated user |
| `POST` | `/api/v1/content` | ✅ | Save new content item |
| `PUT` | `/api/v1/content/:id` | ✅ | Edit title, note, tags of content |
| `PATCH` | `/api/v1/content/:id/pin` | ✅ | Toggle pinned status |
| `DELETE` | `/api/v1/content` | ✅ | Delete a content item |

### AI

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/ai/summarize` | ✅ | Generate AI summary for content |

### Brain Sharing

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/brain/share` | ✅ | Enable/disable brain sharing |
| `GET` | `/api/v1/brain/:shareLink` | ❌ | Get public shared brain content |

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/health` | ❌ | Server health check |

---

## 📊 Data Models

### User
```typescript
{
  _id:       ObjectId,
  username:  string (unique, required),
  password:  string (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Content
```typescript
{
  _id:       ObjectId,
  title:     string (required),
  link:      string (default: ""),
  type:      "tweet" | "youtube" | "document" | "link" | "note",
  note:      string (default: ""),
  tags:      string[],
  pinned:    boolean (default: false),
  userId:    ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Link (Brain Sharing)
```typescript
{
  _id:       ObjectId,
  hash:      string (unique),
  userId:    ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### Local Development

```bash
# Clone the repository
git clone https://github.com/HarshMishra2803/synapseai.git
cd synapseai

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your values

# Build and start
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_PASSWORD` | ✅ | Secret key for signing JWT tokens |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated allowed CORS origins |
| `GROQ_API_KEY` | ⭐ | Groq API key for AI summarization |
| `GEMINI_API_KEY` | ⭐ | Google Gemini API key (fallback) |
| `PORT` | ❌ | Server port (default: 3000) |

---

## 🔒 Security

- ✅ Passwords stored as plaintext (upgrade path: bcrypt hashing)
- ✅ JWT tokens — stateless, no session storage needed
- ✅ All content routes verify token AND ownership (`userId` match)
- ✅ CORS allowlist via environment variable
- ✅ API keys server-side only — never exposed to frontend

---

## 📦 Scripts

```bash
npm run build   # Compile TypeScript → JavaScript (dist/)
npm start       # Run compiled server (node dist/index.js)
npm run dev     # Build + start (for local development)
```

---

## 🌐 Deployment on Render

1. Connect GitHub repo to Render
2. **Build Command:** `npm install && npm run build`
3. **Start Command:** `npm start`
4. Add environment variables in Render dashboard
5. Deploy!

---

## 📄 License

MIT © [Harsh Mishra](https://github.com/HarshMishra2803)
