# AI Support Agent

AI-powered customer support chat application built for the Spur Founding Full Stack Engineer take-home assignment.

The app simulates a live support chat widget for a fictional e-commerce store. Customers can ask questions, the backend persists the conversation, and Gemini 2.5 Flash generates grounded support replies using store FAQ knowledge and recent chat history.

## Project Overview

This project is intentionally structured like the first version of a real customer engagement platform rather than a single CRUD route.

Core capabilities:

- Modern support chat widget UI
- Session persistence with `localStorage`
- Conversation history restore on reload
- PostgreSQL persistence through Prisma
- Gemini-backed LLM provider abstraction
- FAQ-grounded prompt construction
- Request validation, rate limiting, timeouts, logging, and graceful errors
- Deployment-ready split frontend/backend architecture

## Architecture

```text
Frontend: React + Vite + Tailwind
  |
  | HTTP JSON API
  v
Backend: Express + TypeScript
  |
  | Prisma ORM
  v
PostgreSQL: Neon or local Postgres
  |
  | LLM provider abstraction
  v
Google Gemini 2.5 Flash
```

Backend layers:

- Routes: endpoint registration only
- Controllers: HTTP request and response handling
- Services: business workflow orchestration
- Repositories: database access through Prisma
- Providers: external integrations such as Gemini
- Middleware: validation, errors, logging, rate limiting, sanitization, and timeout protection

The LLM integration is hidden behind an `LLMProvider` interface, so Gemini can be replaced later with another provider without changing chat orchestration.

## Folder Structure

```text
backend/
  prisma/
    schema.prisma
  src/
    config/
    controllers/
    data/
    database/
    generated/
    middleware/
    providers/
    repositories/
    routes/
    services/
    types/
    utils/

frontend/
  src/
    components/
    hooks/
    pages/
    services/
    store/
    types/
```

## API Design

Base URL in local development:

```text
http://localhost:4000
```

### Health Check

```http
GET /api/health
```

Response:

```json
{
  "status": "ok"
}
```

### Send Chat Message

```http
POST /api/chat/message
```

Request:

```json
{
  "message": "What is your return policy?",
  "sessionId": "optional-existing-session-id"
}
```

Response:

```json
{
  "reply": "You can request a return within 30 days of delivery...",
  "sessionId": "conversation-session-id"
}
```

Validation:

- `message` is required
- empty messages are rejected
- messages over 2000 characters are rejected
- missing `sessionId` creates a new conversation

### Fetch Chat History

```http
GET /api/chat/history/:sessionId
```

Response:

```json
{
  "sessionId": "conversation-session-id",
  "messages": [
    {
      "id": "message-id",
      "conversationId": "conversation-id",
      "sender": "USER",
      "content": "What is your return policy?",
      "createdAt": "2026-06-04T12:00:00.000Z"
    }
  ]
}
```

Unknown sessions return an empty message list.

## Database Schema

Database: PostgreSQL

ORM: Prisma

```prisma
enum MessageSender {
  USER
  AI
}

model Conversation {
  id        String    @id @default(uuid()) @db.Uuid
  sessionId String    @unique
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  messages  Message[]
}

model Message {
  id             String        @id @default(uuid()) @db.Uuid
  conversationId String        @db.Uuid
  sender         MessageSender
  content        String
  createdAt      DateTime      @default(now())
  conversation   Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}
```

## Gemini Integration

Provider: Google Gemini API

SDK: `@google/genai`

Model: `gemini-2.5-flash`

The Gemini call is implemented in `GeminiProvider`, which conforms to the shared `LLMProvider` interface:

```ts
generateReply(history, message): Promise<string>
```

Prompt construction is handled by `PromptBuilder` and includes:

- system instructions
- FAQ knowledge
- recent conversation history
- current customer message

The FAQ knowledge lives in `backend/src/data/storeKnowledge.ts` and includes:

- Shipping Policy
- Returns Policy
- Refund Policy
- Support Hours

LLM safeguards:

- request timeout
- max output token limit
- prompt character budget
- recent-history limit
- graceful timeout, rate-limit, empty-response, and API-failure handling

## Local Setup

Requirements:

- Node.js 20+
- npm 10+
- PostgreSQL database
- Google Gemini API key

Install dependencies:

```bash
npm install
```

Create backend env file:

```bash
cp backend/.env.example backend/.env
```

Create frontend env file:

```bash
cp frontend/.env.example frontend/.env
```

Update `backend/.env` with your database URL and Gemini API key.

## Environment Variables

Backend: `backend/.env`

```bash
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://user:password@localhost:5432/ai_support_agent?schema=public
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
LLM_TIMEOUT_MS=15000
LLM_MAX_OUTPUT_TOKENS=512
LLM_MAX_HISTORY_MESSAGES=12
LLM_MAX_PROMPT_CHARS=12000
API_TIMEOUT_MS=20000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=60
```

Frontend: `frontend/.env`

```bash
VITE_API_BASE_URL=http://localhost:4000
```

## Running Frontend

```bash
npm run dev:frontend
```

Default URL:

```text
http://localhost:5173
```

## Running Backend

```bash
npm run dev:backend
```

Default URL:

```text
http://localhost:4000
```

Health check:

```bash
curl http://localhost:4000/api/health
```

## Running Prisma Migrations

Generate Prisma Client:

```bash
npm run prisma:generate --workspace backend
```

Create and apply a local migration:

```bash
npm run prisma:migrate --workspace backend
```

Open Prisma Studio:

```bash
npm run prisma:studio --workspace backend
```

For deployment databases, use Prisma migration commands from the backend service environment after setting `DATABASE_URL`.

## Validation

Run all checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Deployment Steps

### Database: Neon

1. Create a Neon PostgreSQL project.
2. Copy the pooled or direct connection string.
3. Set it as `DATABASE_URL` in Render.
4. Run Prisma migrations against the Neon database.

### Backend: Render

1. Create a new Render Web Service.
2. Connect the GitHub repository.
3. Set root directory to `backend` if deploying the backend as its own service.
4. Build command:

```bash
npm install && npm run build
```

5. Start command:

```bash
npm run start
```

6. Add environment variables:

```bash
NODE_ENV=production
PORT=4000
CORS_ORIGIN=https://your-vercel-app.vercel.app
DATABASE_URL=your_neon_database_url
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

7. Run Prisma migration for the production database before testing the deployed app.

### Frontend: Vercel

1. Create a new Vercel project.
2. Connect the GitHub repository.
3. Set root directory to `frontend`.
4. Build command:

```bash
npm run build
```

5. Output directory:

```text
dist
```

6. Add environment variable:

```bash
VITE_API_BASE_URL=https://your-render-backend.onrender.com
```

7. Redeploy after the Render backend URL is available.

## Tradeoffs

- The rate limiter is in-memory. It is simple and effective for one server instance, but Redis would be better for distributed deployments.
- The chat UI currently uses request/response HTTP instead of streaming. This keeps the first version reliable and easy to reason about.
- The knowledge base is stored in code instead of a vector database. This is enough for a small FAQ and makes future RAG migration straightforward.
- There is no authentication because the assignment explicitly does not require it.
- Observability uses structured console logs. A production system should send logs and metrics to a dedicated platform.

## Future Improvements

- Redis caching
- Streaming responses
- WebSockets
- Multi-channel support for WhatsApp, Instagram, Facebook, and live chat
- RAG over a real merchant knowledge base
- Tool calling for order lookup, refunds, and CRM updates
- Analytics for resolution rate, response time, FAQ gaps, and customer sentiment

