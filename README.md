<h1 align="center">🧠 SynapseAI — Backend API</h1>
<h3 align="center">The REST API powering SynapseAI's Second Brain platform</h3>

<p align="center">
  <a href="https://synapseai-backend-ocgv.onrender.com/api/v1/health"><img src="https://img.shields.io/badge/API_Status-Live-10b981?style=flat-square&logo=render&logoColor=white" /></a>
  <a href="https://github.com/HarshMishra2803/synapseai/commits/main"><img src="https://img.shields.io/github/last-commit/HarshMishra2803/synapseai?style=flat-square&color=blue" /></a>
  <img src="https://img.shields.io/badge/Endpoints-10-informational?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Auth-JWT-black?style=flat-square&logo=jsonwebtokens&logoColor=white" />
</p>

<p align="center">
  <a href="https://synapseai-front.vercel.app"><b>Live App</b></a> ·
  <a href="https://github.com/HarshMishra2803/synapseai-front"><b>Frontend Repo</b></a> ·
  <a href="#-api-reference"><b>API Docs</b></a> ·
  <a href="https://synapseai-backend-ocgv.onrender.com/api/v1/health"><b>Health Check</b></a>
</p>

<br/>

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#️-architecture)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Sample Requests](#-sample-requests)
- [Data Models](#-data-models)
- [Error Handling](#-error-handling)
- [Getting Started](#-getting-started)
- [Security](#-security)
- [Deployment](#-deployment-on-render)
- [Roadmap](#️-roadmap)
- [Author](#-author)

<br/>

## ⚡ Overview

SynapseAI is a **Second Brain** SaaS — a single place to save YouTube videos, tweets, articles, documents, and notes, tag them, and get AI-generated summaries on demand. This repo is the **backend**: a production REST API that handles authentication, content storage, AI summarization, and public brain-sharing for the [SynapseAI frontend](https://github.com/HarshMishra2803/synapseai-front).

It's built as a small, focused API — **10 endpoints**, one auth strategy, one database — rather than a sprawling service, so the whole request lifecycle (auth → ownership check → DB → response) stays easy to reason about end to end.

<br/>

## ✨ Features

- 🔐 **JWT Authentication** — stateless, token-based sessions, no server-side session storage
- 📝 **Full CRUD** — create, read, update, delete, and pin content items
- 🤖 **AI Summarization with fallback** — Groq (Llama 3.1) primary, Gemini second, local text extraction as a last resort, so a summary request never just fails
- 🔗 **Brain Sharing** — generate a unique, crypto-based public link to share your whole brain read-only, revoke it anytime
- 🌍 **CORS Allowlisting** — origin control driven entirely by an environment variable, no hardcoded domains
- 🏥 **Health Endpoint** — `/api/v1/health` for uptime monitoring / deployment checks
- 🛡️ **Ownership Enforcement** — every content route checks both the JWT **and** that the resource actually belongs to the requesting user

<br/>

## 🏛️ Architecture

```
Client (React SPA)
        │  HTTPS + JWT Bearer token
        ▼
Express 5 API (this repo)
        │
        ├──► MongoDB Atlas ──► users · content · share-links
        │
        └──► AI Fallback Chain
                 1. Groq (Llama 3.1)  ──► fast, primary
                 2. Google Gemini     ──► fallback on failure/timeout
                 3. Local extraction  ──► guarantees a response either way
```

**Request lifecycle for a protected route:**

```
Request ──► CORS check ──► JWT verify (middleware.ts) ──► attach userId to req
        ──► Mongoose query scoped to that userId ──► response
```

Every protected route re-derives `userId` from the verified token — it's never trusted from the request body — so one user can't read or modify another user's content even if they guess an ID.

<br/>

## 🛠️ Tech Stack

| | |
|---|---|
| **Runtime** | Node.js 18+ |
| **Framework** | Express 5 |
| **Language** | TypeScript 5 |
| **Database** | MongoDB Atlas |
| **ODM** | Mongoose 9 |
| **Auth** | JSON Web Tokens (JWT) |
| **AI** | Groq API (Llama 3.1) + Gemini fallback |
| **Hosting** | Render |

<br/>

## 📁 Project Structure

```
src/
├── index.ts        # Express app, route definitions, server start
├── db.ts            # Mongoose connection + schema/model definitions
├── middleware.ts    # JWT auth middleware (userMiddleware)
└── config.ts         # Environment variable exports
```

Kept intentionally flat — four files, each with one job — since a 10-endpoint API doesn't need a deep folder hierarchy to stay readable.

<br/>

## 🔌 API Reference

**Auth**

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/v1/signup` | ❌ | Create a new account |
| `POST` | `/api/v1/signin` | ❌ | Log in, receive JWT |

**Content**

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/v1/content` | ✅ | Get all content for the user |
| `POST` | `/api/v1/content` | ✅ | Save a new content item |
| `PUT` | `/api/v1/content/:id` | ✅ | Edit title, note, tags |
| `PATCH` | `/api/v1/content/:id/pin` | ✅ | Toggle pinned status |
| `DELETE` | `/api/v1/content` | ✅ | Delete a content item |

**AI**

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/v1/ai/summarize` | ✅ | Generate an AI summary |

**Brain Sharing**

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/api/v1/brain/share` | ✅ | Enable/disable sharing |
| `GET` | `/api/v1/brain/:shareLink` | ❌ | View a shared brain publicly |

**Health**

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/v1/health` | ❌ | Server health check |

<br/>

## 📮 Sample Requests

<details>
<summary><b>POST /api/v1/signup</b></summary>

```bash
curl -X POST https://synapseai-backend-ocgv.onrender.com/api/v1/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "harsh", "password": "yourpassword"}'
```

```json
{
  "message": "User created successfully"
}
```
</details>

<details>
<summary><b>POST /api/v1/signin</b></summary>

```bash
curl -X POST https://synapseai-backend-ocgv.onrender.com/api/v1/signin \
  -H "Content-Type: application/json" \
  -d '{"username": "harsh", "password": "yourpassword"}'
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
</details>

<details>
<summary><b>POST /api/v1/content</b></summary>

```bash
curl -X POST https://synapseai-backend-ocgv.onrender.com/api/v1/content \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Great thread on system design",
    "link": "https://twitter.com/...",
    "type": "tweet",
    "tags": ["system-design", "read-later"]
  }'
```

```json
{
  "message": "Content saved",
  "content": {
    "_id": "665f1a...",
    "title": "Great thread on system design",
    "type": "tweet",
    "tags": ["system-design", "read-later"],
    "pinned": false
  }
}
```
</details>

<details>
<summary><b>POST /api/v1/ai/summarize</b></summary>

```bash
curl -X POST https://synapseai-backend-ocgv.onrender.com/api/v1/ai/summarize \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"contentId": "665f1a..."}'
```

```json
{
  "summary": "A concise, AI-generated summary of the saved content.",
  "provider": "groq"
}
```

`provider` reflects which tier of the fallback chain actually served the request — useful for debugging when Groq is rate-limited and Gemini quietly picks up the request instead.
</details>

<br/>

## 📊 Data Models

<details>
<summary><b>User</b></summary>

```ts
{
  _id:       ObjectId,
  username:  string (unique, required),
  password:  string (required),
  createdAt: Date,
  updatedAt: Date
}
```
</details>

<details>
<summary><b>Content</b></summary>

```ts
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
</details>

<details>
<summary><b>Link (Brain Sharing)</b></summary>

```ts
{
  _id:       ObjectId,
  hash:      string (unique),
  userId:    ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```
</details>

<br/>

## ⚠️ Error Handling

The API returns consistent JSON error shapes so the frontend can handle failures predictably:

```json
{
  "message": "Invalid credentials"
}
```

| Status | Meaning |
|---|---|
| `400` | Malformed request body / validation failure |
| `401` | Missing, invalid, or expired JWT |
| `403` | Valid JWT, but the resource doesn't belong to this user |
| `404` | Resource not found |
| `500` | Unhandled server error (logged server-side) |

<br/>

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### Installation

```bash
git clone https://github.com/HarshMishra2803/synapseai.git
cd synapseai
npm install

cp .env.example .env
# fill in your values

npm run dev
```

### Environment Variables

| Variable | Required | Description |
|---|:---:|---|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_PASSWORD` | ✅ | Secret key for signing JWTs |
| `ALLOWED_ORIGINS` | ✅ | Comma-separated CORS allowlist |
| `GROQ_API_KEY` | ⭐ | Groq API key for AI summarization |
| `GEMINI_API_KEY` | ⭐ | Gemini API key (fallback) |
| `PORT` | ❌ | Server port (default: 3000) |

<br/>

## 🔒 Security

- ✅ JWT-based auth — stateless, no session storage
- ✅ Every content route verifies token **and** resource ownership (`userId` match)
- ✅ CORS allowlist enforced via environment variable
- ✅ AI provider keys stay server-side, never exposed to the client
- 🔧 **Known limitation:** passwords are not yet hashed — bcrypt hashing is the next planned upgrade before any production/real-user rollout

<br/>

## 📦 Scripts

```bash
npm run build   # Compile TypeScript → JavaScript (dist/)
npm start        # Run compiled server
npm run dev       # Build + start (local development)
```

<br/>

## 🌐 Deployment on Render

1. Connect this repo to Render
2. **Build:** `npm install && npm run build`
3. **Start:** `npm start`
4. Add environment variables in the Render dashboard
5. Deploy

<br/>

## 🗺️ Roadmap

- [ ] bcrypt password hashing
- [ ] Rate limiting on auth and AI endpoints
- [ ] Automated tests (Jest + Supertest)
- [ ] Pagination for `GET /api/v1/content`
- [ ] Refresh tokens (currently single long-lived JWT)

<br/>

## 👤 Author

**Harsh Mishra** — B.Tech CSE, Babu Banarasi Das University
[GitHub](https://github.com/HarshMishra2803) · [LinkedIn](https://linkedin.com/in/harshmishra2803cse)

<br/>

<p align="center"><sub>MIT Licensed · © Harsh Mishra</sub></p>
