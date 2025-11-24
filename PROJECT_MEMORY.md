# PROJECT MEMORY: Linguista Italian Learning Platform

## Status
**Current Phase:** MVP Complete - Ready for Testing & Deployment

## Done - All Core Features Implemented ✅

### Phase 1: Scaffold & Configuration
- ✅ Initialized Next.js 14 with App Router
- ✅ Configured TypeScript and ESLint
- ✅ Set up Tailwind CSS styling
- ✅ Created environment variable configuration
- ✅ Installed all dependencies (Next.js, React, NextAuth, Prisma, bcryptjs)

### Phase 2: Database & Data Foundation
- ✅ Set up Prisma ORM with SQLite
- ✅ Defined complete database schema (User, Vocabulary, Conjugation, UserProgress)
- ✅ Created comprehensive seed script with 100 curated Italian words
- ✅ Added verb conjugations for essere, avere, and fare (54 total conjugations)
- ✅ Implemented automatic user progress initialization

### Phase 3: Authentication & Core UI
- ✅ Implemented NextAuth with Credentials provider
- ✅ Created login and registration pages
- ✅ Built landing page with responsive design
- ✅ Created user dashboard with comprehensive statistics
- ✅ Built Flashcard component with flip animation
- ✅ Implemented Quiz page with progress tracking
- ✅ Created Vocabulary list page with sorting and filtering

### Phase 4: Learning System
- ✅ Implemented Spaced Repetition System (Leitner Box algorithm)
- ✅ Created SRS calculation library (lib/srs.ts)
- ✅ Built API endpoints for quiz functionality
- ✅ Integrated real-time progress updates
- ✅ Added accuracy and review statistics

### Phase 5: Automation & Integration
- ✅ Created N8N webhook endpoint (/api/webhooks/content-ingest)
- ✅ Implemented webhook authentication with secret token
- ✅ Added batch vocabulary import functionality

### Phase 6: Deployment Preparation
- ✅ Created multi-stage Dockerfile
- ✅ Configured docker-compose.yml
- ✅ Added health check endpoint
- ✅ Configured Next.js standalone output
- ✅ Created comprehensive README.md
- ✅ Added production environment template

## Next Steps (Optional Enhancements)
1. **Test the application locally** - Run dev server and test all features
2. **Deploy to Linode** - Follow README deployment instructions
3. **Add OpenAI TTS** - Implement audio pronunciation when API key available
4. **Add Whisper integration** - Speech recognition for practice
5. **Expand vocabulary** - Add more words via N8N or manual seeding
6. **Add more conjugations** - Expand verb conjugation tables

## Architecture

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** SQLite via Prisma ORM
- **Auth:** NextAuth.js (Credentials provider)
- **Styling:** Tailwind CSS
- **Deployment:** Docker (Linode-ready)
- **APIs (Future):** OpenAI Whisper/TTS, DeepL

### Database Schema (Implemented)

#### User
- id (String, @id, cuid)
- email (String, unique)
- password (String, hashed)
- name (String)
- createdAt (DateTime)
- updatedAt (DateTime)
- userProgress (UserProgress[])

#### Vocabulary
- id (String, @id, cuid)
- italian (String)
- english (String)
- partOfSpeech (String)
- exampleSentence (String)
- frequency (Int) - for ranking common words
- createdAt (DateTime)
- conjugations (Conjugation[])
- userProgress (UserProgress[])

#### Conjugation
- id (String, @id, cuid)
- vocabularyId (String, FK)
- tense (String) - Presente, Passato, Futuro, etc.
- person (String) - io, tu, lui/lei, noi, voi, loro
- form (String) - the conjugated form
- vocabulary (Vocabulary)

#### UserProgress
- id (String, @id, cuid)
- userId (String, FK)
- vocabularyId (String, FK)
- boxLevel (Int) - 1 to 5 (Leitner System)
- nextReviewDate (DateTime)
- lastQualityScore (Int) - 0 to 5
- reviewCount (Int)
- createdAt (DateTime)
- updatedAt (DateTime)
- user (User)
- vocabulary (Vocabulary)
- @@unique([userId, vocabularyId])

### SRS Algorithm (Leitner Box System)
- Box 1: Review daily
- Box 2: Review every 2 days
- Box 3: Review every 4 days
- Box 4: Review weekly
- Box 5: Review every 2 weeks

Quality scores determine box progression:
- Score 4-5: Move up one box
- Score 2-3: Stay in current box
- Score 0-1: Move back to Box 1

## Notes
- Using SQLite for simplicity in MVP; can migrate to PostgreSQL later
- Audio features (TTS/Whisper) will check for API keys before activation
- N8N webhook will require secret token for security
- Initial seed data will come from open-source Italian frequency lists
