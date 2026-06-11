<div align="center">

<img src="https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white&style=for-the-badge" />
<img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=for-the-badge" />
<img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white&style=for-the-badge" />
<img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white&style=for-the-badge" />
<img src="https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white&style=for-the-badge" />

# 🧠 SynapseAI — Backend API

**A production-ready REST API for the SynapseAI Second Brain application.**  
Built with Express 5, TypeScript, MongoDB Atlas, and JWT authentication.

[Frontend](https://synapseai-front.vercel.app) · [Frontend Repo](https://github.com/HarshMishra2803/synapseai-front) · [API Reference](#api-reference)

</div>

---

## ✨ Features

- 🔐 **JWT Authentication** — Stateless token-based auth with `jsonwebtoken`
- 📝 **Full CRUD for Content** — Create, read, and delete content with type, tags, and notes
- 🌐 **Brain Sharing** — Generate/revoke a secure random hash link to share a brain publicly
- 🔒 **Auth Middleware** — Protected routes validate Bearer tokens on every request
- 🌍 **CORS Configured** — Ready for cross-origin requests from frontend deployments
- ✅ **Input Validation** — Server-side validation with meaningful error messages
- 🗄️ **MongoDB Atlas** — Cloud-hosted, schema-validated collections via Mongoose

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | [Node.js 22](https://nodejs.org/) |
| **Framework** | [Express 5](https://expressjs.com/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| **ODM** | [Mongoose 9](https://mongoosejs.com/) |
| **Auth** | [JSON Web Tokens](https://jwt.io/) via `jsonwebtoken` |
| **CORS** | [`cors`](https://www.npmjs.com/package/cors) middleware |
| **Environment** | [`dotenv`](https://www.npmjs.com/package/dotenv) |
| **Build** | TypeScript compiler (`tsc`) |

---

## 📁 Project Structure

```
synapseAi/
├── src/
│   ├── index.ts          # Express app, all route handlers, server entry
│   ├── db.ts             # MongoDB connection + Mongoose schemas & models
│   ├── middleware.ts      # JWT auth middleware
│   └── config.ts         # App constants (JWT secret)
├── dist/                 # Compiled JavaScript output (git-ignored)
├── .env                  # Environment variables (git-ignored)
├── .env.example          # Example env file (safe to commit)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📊 Data Models

### User
```typescript
{
  _id:       ObjectId
  username:  string    // unique, required, min 3 chars
  password:  string    // required, min 6 chars (store hashed in production)
  createdAt: Date
  updatedAt: Date
}
```

### Content
```typescript
{
  _id:       ObjectId
  title:     string    // required
  link:      string    // URL (optional for notes)
  type:      'tweet' | 'youtube' | 'document' | 'link' | 'note'
  note:      string    // optional description / body text
  tags:      string[]  // array of plain-string tags
  userId:    ObjectId  // ref: User (required)
  createdAt: Date
  updatedAt: Date
}
```

### Link (Brain Sharing)
```typescript
{
  _id:       ObjectId
  hash:      string    // unique 32-char hex string (crypto.randomBytes)
  userId:    ObjectId  // ref: User (unique — one link per user)
  createdAt: Date
}
```

---

## 🌐 API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/signup` | ❌ | Create a new user account |
| `POST` | `/api/v1/signin` | ❌ | Sign in and receive a JWT token |

#### POST `/api/v1/signup`
```json
// Request body
{ "username": "johndoe", "password": "secret123" }

// 201 Created
{ "message": "User signed up successfully" }

// 409 Conflict
{ "message": "Username already exists" }
```

#### POST `/api/v1/signin`
```json
// Request body
{ "username": "johndoe", "password": "secret123" }

// 200 OK
{ "token": "eyJhbGci..." }

// 403 Forbidden
{ "message": "Incorrect credentials" }
```

---

### Content (🔒 Requires Authorization header)

```
Authorization: <jwt_token>
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/content` | Fetch all content for the authenticated user |
| `POST` | `/api/v1/content` | Create a new content item |
| `DELETE` | `/api/v1/content` | Delete a content item by ID |

#### POST `/api/v1/content`
```json
// Request body
{
  "title": "Awesome React Article",
  "link": "https://react.dev",
  "type": "link",
  "tags": ["react", "frontend"],
  "note": "Great resource for hooks"
}

// 201 Created
{ "message": "Content Created", "content": { ...contentObject } }
```

#### DELETE `/api/v1/content`
```json
// Request body
{ "contentId": "64a1f..." }

// 200 OK
{ "message": "Content Deleted" }
```

---

### Brain Sharing

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/brain/share` | 🔒 | Enable or disable public brain sharing |
| `GET` | `/api/v1/brain/:shareLink` | ❌ | Fetch a shared brain by hash |

#### POST `/api/v1/brain/share`
```json
// Enable sharing
{ "share": true }
// Response: { "hash": "a3f2e1d4..." }

// Disable sharing
{ "share": false }
// Response: { "message": "Sharing disabled" }
```

#### GET `/api/v1/brain/:shareLink`
```json
// 200 OK
{
  "username": "johndoe",
  "content": [ ...contentArray ]
}

// 404 Not Found
{ "message": "Shared brain not found" }
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (free tier works perfectly)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/synapseai-backend.git
cd synapseai-backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env and set MONGO_URI and JWT_SECRET
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `PORT` | ❌ | Server port (default: `3000`) |

### Running the Server

```bash
# Development (build + run)
npm run dev

# Build TypeScript
npm run build

# Production (run compiled JS)
npm start
```

The API will be available at `http://localhost:3000`

---

## 🔒 Security Considerations

> These are improvements recommended before production deployment:

- **Password Hashing** — Currently stores plain text. Add `bcrypt` before going live:
  ```bash
  npm install bcrypt @types/bcrypt
  ```
- **Environment Secrets** — Never commit `.env`. Rotate `JWT_SECRET` regularly.
- **Rate Limiting** — Add `express-rate-limit` to auth routes.
- **Helmet** — Add `helmet` for secure HTTP headers.

---

## 🚢 Deployment

### Railway (Recommended)

1. Connect your GitHub repo to [Railway](https://railway.app)
2. Set environment variables (`MONGO_URI`) in Railway dashboard
3. Railway auto-detects `npm start` from `package.json`

### Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Build command: `npm run build`
3. Start command: `npm start`
4. Add environment variables in Render dashboard

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License.

---

<div align="center">
  Built with ❤️ and lots of ☕ by <a href="https://github.com/HarshMishra2803">Harsh Mishra</a>
</div>
