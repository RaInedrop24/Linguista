# Google Cloud TTS Setup Instructions

## How to Get Your API Key

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/

2. **Enable the Text-to-Speech API**:
   - Go to: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com
   - Click "ENABLE" if not already enabled

3. **Create an API Key**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "CREATE CREDENTIALS" → "API key"
   - Copy the API key (it looks like: `AIzaSy...`)

4. **Add to your `.env` file**:
   ```
   GOOGLE_CLOUD_API_KEY=AIzaSy_your_key_here
   ```

5. **Restart the dev server**:
   ```bash
   npm run dev
   ```

6. **Clear audio cache**:
   ```powershell
   Invoke-RestMethod -Method DELETE -Uri "http://localhost:3002/api/admin/reset-audio"
   ```

## Voice Options

Edit `app/api/tts/[vocabularyId]/route.ts` (lines 65-67) to change voice:

**Female voices:**
- `it-IT-Wavenet-A` (Premium, natural)
- `it-IT-Wavenet-B` (Premium, natural)
- `it-IT-Standard-A` (Standard quality, cheaper)

**Male voices:**
- `it-IT-Wavenet-C` (Premium, natural) 
- `it-IT-Wavenet-D` (Premium, natural) ← **Current**
- `it-IT-Standard-B` (Standard quality, cheaper)

## Pricing

- **Wavenet voices**: $16 per 1M characters (~$0.048 for 3000 words)
- **Standard voices**: $4 per 1M characters (~$0.012 for 3000 words)
- **Free tier**: 1M characters per month

## Testing

After adding the API key and restarting:
1. Clear cache (command above)
2. Go to http://localhost:3002/quiz
3. Click "🔊 Listen" on "Come"
4. Should now say "com-eh" in perfect Italian! 🇮🇹
