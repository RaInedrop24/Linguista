# Quick Start Guide - Linguista

## Get Started in 3 Steps

### Step 1: Start the Development Server

```bash
npm run dev
```

Open http://localhost:3002 in your browser.

### Step 2: Login with Demo Account

- **Email**: demo@linguista.com
- **Password**: password123

### Step 3: Start Learning!

1. Click **"Start Learning"** on the dashboard
2. Review Italian flashcards
3. Click the **🔊 Listen** button to hear native Italian pronunciation
4. Flip the card to see translations and example sentences
5. Click **"I knew it"** or **"I didn't know it"**
6. Watch your progress grow!

## What You Can Do

### Dashboard
- View your learning statistics
- See words due for review
- Track youraccuracy  
- Practice without affecting scores (Practice Quiz)
- Reset your progress to start fresh

### Quiz
- Practice with interactive flashcards
- Hear native Italian pronunciation  
- See example sentences in Italian and English
- The spaced repetition system schedules optimal review times

### Vocabulary List
- Browse all 600+ Italian words
- See your progress for each word
- Track which box level each word is in
- Check next review dates

## How the Learning System Works

**Leitner Box System** (Spaced Repetition):
- Box 1: Review daily
- Box 2: Review every 2 days
- Box 3: Review every 4 days
- Box 4: Review weekly
- Box 5: Review every 2 weeks

When you answer correctly, words move up a box (longer intervals).
When you answer incorrectly, words move back to Box 1.

## Create a New Account

1. Click **"Get Started"** or **"Sign In"** on the home page
2. Click **"Register here"**
3. Fill in your name, email, and password
4. Start learning with 20 initial words!

## Database Management

The application uses SQLite stored in `prisma/dev.db`.

### View/Edit the Database (Prisma Studio)
```bash
npx prisma studio
```
Opens GUI at http://localhost:5555

### Edit Vocabulary
1. Open Prisma Studio
2. Click on **Vocabulary** table
3. Search for a word (e.g., "suo")
4. Edit the `exampleSentence` field
5. Click **Save**

### Reset Everything (WARNING: Deletes progress)
```bash
npx prisma migrate reset
npx tsx prisma/seed.ts
```

## Admin Commands

### Clear Audio Cache
```powershell
Invoke-RestMethod -Method DELETE -Uri "http://localhost:3002/api/admin/reset-audio"
```

This clears all generated audio files and database references, forcing regeneration on next play.

## Commands Cheat Sheet

```bash
npm run dev          # Start development server (port 3002)
npm run build        # Build for production
npm run start        # Start production server

npx prisma studio    # Open database GUI
npx prisma migrate dev    # Apply database migrations
npx tsx prisma/seed.ts    # Re-seed database
npx prisma generate  # Regenerate Prisma client
```

## Google Cloud Setup

The app uses Google Cloud for:
- **Text-to-Speech** (authentic Italian voices)
- **Translation** (example sentences)

**Required**:
1. Enable APIs at https://console.cloud.google.com/
   - Text-to-Speech API
   - Cloud Translation API
2. Get API key from https://console.cloud.google.com/apis/credentials
3. Add to `.env`: `GOOGLE_CLOUD_API_KEY="your-key"`

See `GOOGLE_CLOUD_TTS_SETUP.md` for detailed instructions.

## Need Help?

- Check `README.md` for full documentation
- Check `GOOGLE_CLOUD_TTS_SETUP.md` for audio setup
- All code is typed with TypeScript

Enjoy learning Italian! 🇮🇹
