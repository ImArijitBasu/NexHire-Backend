# NexHire - AI-Driven Job Search Platform (Server)

The robust, scalable backend for NexHire, providing secure APIs, AI integrations, and real-time data management.

## 🛠️ Tech Stack
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Better Auth (JWT based)
- **AI Integration**: Google Generative AI (Gemini SDK)
- **Logging**: Winston
- **Rate Limiting**: Express Rate Limit
- **Caching**: Node-cache

## 🚀 Advanced Engineering
- **Security**: Implemented Helmet.js, CORS, and Rate Limiting for production safety.
- **Performance**: Caching layers for frequently accessed data (categories, stats).
- **Error Handling**: Centralized global error handling middleware with Winston logging.
- **AI Response Parsing**: Robust regex-based JSON parsing for structured AI outputs.

## 📡 API Modules
- **/api/auth**: Authentication & User Management.
- **/api/jobs**: Job listings, CRUD, and advanced search/filtering.
- **/api/applications**: Job application workflow.
- **/api/ai**: AI features (Resume analysis, Cover letter gen, Job matching, Interview coach).
- **/api/admin**: Admin dashboard data and moderation tools.
- **/api/blogs**: Dynamic blogging system.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 20+
- PostgreSQL database

### Installation
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   PORT=5000
   DATABASE_URL="your_postgresql_url"
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   BETTER_AUTH_SECRET="your_random_secret"
   BETTER_AUTH_URL="http://localhost:5000/api/better-auth"
   CLIENT_URL="http://localhost:3000"
   GEMINI_API_KEY="your_gemini_api_key"
   ```
4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Seed initial data (optional):
   ```bash
   npm run seed
   ```
6. Start the server:
   ```bash
   npm run dev
   ```

## 📄 License
ISC
