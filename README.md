# Linguista - Italian Learning Platform

A feature-rich, multi-user Italian learning web application built with Next.js 14, featuring spaced repetition learning, interactive flashcards with native Italian audio, and progress tracking.

## Features

- **User Authentication**: Secure email/password authentication with NextAuth.js
- **Spaced Repetition System (SRS)**: Leitner Box algorithm for optimal word retention
- **Interactive Flashcards**: Learn Italian words with translations and example sentences
- **Native Italian Audio**: Google Cloud Text-to-Speech with authentic Italian pronunciation
- **Automatic Translations**: Example sentences translated using Google Translate API
- **Practice Mode**: Quiz without affecting progress scores
- **Progress Tracking**: Monitor your learning journey with detailed statistics
- **Progress Reset**: Start fresh with new vocabulary anytime
- **Verb Conjugations**: Learn Italian verb conjugations (essere, avere, fare)
- **Multi-user Support**: Each user has their own progress tracking
- **600+ Vocabulary Words**: Curated high-frequency Italian words
- **Docker Ready**: Easy deployment with Docker and docker-compose

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite via Prisma ORM
- **Authentication**: NextAuth.js (Credentials provider)
- **Styling**: Tailwind CSS
- **TTS**: Google Cloud Text-to-Speech API
- **Translation**: Google Cloud Translation API
- **Deployment**: Docker

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn
- Google Cloud account with API key (for audio and translations)

### Local Development

1. **Clone the repository**

```bash
git clone <repository-url>
cd Learn_Italian_Site
```

2. **Install dependencies**

```bash
npm install --legacy-peer-deps
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="your-secret-here"

# Google Cloud API Key (for TTS and Translation)
GOOGLE_CLOUD_API_KEY="your-google-cloud-api-key"

# Optional: OpenAI  (legacy, not currently used)
OPENAI_API_KEY="your-openai-key"
```

**To get your Google Cloud API Key**:
1. Go to https://console.cloud.google.com/
2. Enable these APIs:
   - Text-to-Speech API: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com
   - Cloud Translation API: https://console.cloud.google.com/apis/library/translate.googleapis.com
3. Create credentials: https://console.cloud.google.com/apis/credentials
4. Click "CREATE CREDENTIALS" → "API key"
5. Copy the key to your `.env` file

4. **Initialize the database**

```bash
npx prisma migrate dev
npx tsx prisma/seed.ts
```

This will create the SQLite database and seed it with 600 curated Italian words.

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) to view the application.

### Demo Credentials

After seeding the database, you can log in with:

- **Email**: demo@linguista.com
- **Password**: password123

## Key Commands

### Development
```bash
npm run dev              # Start development server (port 3002)
npm run build            # Build for production
npm run start            # Start production server
```

### Database Management
```bash
npx prisma studio        # Open Prisma Studio GUI (http://localhost:5555)
npx prisma migrate dev   # Create and apply database migrations
npx tsx prisma/seed.ts   # Re-seed database with vocabulary
npx prisma generate      # Regenerate Prisma client after schema changes
```

### Admin Utilities
```bash
# Clear all TTS audio cache (database and files)
Invoke-RestMethod -Method DELETE -Uri "http://localhost:3002/api/admin/reset-audio"

# Or in bash:
curl -X DELETE http://localhost:3002/api/admin/reset-audio
```

## Spaced Repetition System

The application uses the Leitner Box System with 5 levels:

- **Box 1**: Review daily (1 day)
- **Box 2**: Review every 2 days
- **Box 3**: Review every 4 days  
- **Box 4**: Review weekly (7 days)
- **Box 5**: Review bi-weekly (14 days)

### Algorithm

- **Score 4-5** (knew it): Move up one box
- **Score 2-3** (uncertain): Stay in current box
- **Score 0-1** (didn't know): Move back to Box 1

## Deployment with Docker

### Using Docker Compose

1. **Set up environment variables in `.env`**

2. **Start the application**

```bash
docker-compose up -d
```

3. **Initialize the database** (first time only)

```bash
docker exec -it linguista-app npx prisma migrate dev
docker exec -it linguista-app npx tsx prisma/seed.ts
```

## Customization

### Adding/Editing Vocabulary

1. **Edit the JSON source**:
   - File: `prisma/italian-vocabulary.json`
   - Format: See existing entries for structure

2. **Update specific words**:
   ```bash
   npx prisma studio
   ```
   - Navigate to Vocabulary table
   - Search and edit
   - Save changes

3. **Re-seed entire database** (WARNING: Deletes progress):
   ```bash
   npx prisma migrate reset
   npx tsx prisma/seed.ts
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT License
