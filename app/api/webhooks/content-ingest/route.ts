import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface VocabularyPayload {
  italian: string;
  english: string;
  partOfSpeech: string;
  exampleSentence?: string;
  frequency?: number;
}

interface WebhookPayload {
  secret: string;
  words: VocabularyPayload[];
}

export async function POST(request: Request) {
  try {
    const body: WebhookPayload = await request.json();

    // Verify webhook secret
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret || body.secret !== webhookSecret) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid webhook secret' },
        { status: 401 }
      );
    }

    if (!body.words || !Array.isArray(body.words) || body.words.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload - words array is required' },
        { status: 400 }
      );
    }

    const results = {
      created: [] as string[],
      updated: [] as string[],
      errors: [] as string[],
    };

    for (const word of body.words) {
      try {
        // Validate required fields
        if (!word.italian || !word.english || !word.partOfSpeech) {
          results.errors.push(
            `Missing required fields for word: ${word.italian || 'unknown'}`
          );
          continue;
        }

        // Check if word already exists
        const existing = await prisma.vocabulary.findFirst({
          where: { italian: word.italian },
        });

        if (existing) {
          // Update existing word
          await prisma.vocabulary.update({
            where: { id: existing.id },
            data: {
              english: word.english,
              partOfSpeech: word.partOfSpeech,
              exampleSentence: word.exampleSentence || existing.exampleSentence,
              frequency: word.frequency || existing.frequency,
              source: 'n8n',
            },
          });
          results.updated.push(word.italian);
        } else {
          // Create new word
          const created = await prisma.vocabulary.create({
            data: {
              italian: word.italian,
              english: word.english,
              partOfSpeech: word.partOfSpeech,
              exampleSentence: word.exampleSentence || '',
              frequency: word.frequency || 0,
              source: 'n8n',
            },
          });
          results.created.push(word.italian);

          // Optionally: Initialize progress for all users with this new word
          // This is commented out to avoid overwhelming users with new words
          // Uncomment if you want automatic word assignment
          /*
          const users = await prisma.user.findMany();
          await prisma.userProgress.createMany({
            data: users.map((user) => ({
              userId: user.id,
              vocabularyId: created.id,
              boxLevel: 1,
              nextReviewDate: new Date(),
              lastQualityScore: 0,
              reviewCount: 0,
              correctCount: 0,
              incorrectCount: 0,
            })),
          });
          */
        }
      } catch (error) {
        console.error(`Error processing word ${word.italian}:`, error);
        results.errors.push(`Failed to process word: ${word.italian}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Content ingestion completed',
      results: {
        created: results.created.length,
        updated: results.updated.length,
        errors: results.errors.length,
      },
      details: results,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Example N8N payload:
/*
{
  "secret": "your-webhook-secret-here",
  "words": [
    {
      "italian": "notizia",
      "english": "news",
      "partOfSpeech": "noun",
      "exampleSentence": "Ho letto la notizia sul giornale. (I read the news in the newspaper.)",
      "frequency": 500
    },
    {
      "italian": "quotidiano",
      "english": "daily, newspaper",
      "partOfSpeech": "noun",
      "exampleSentence": "Leggo il quotidiano ogni mattina. (I read the newspaper every morning.)",
      "frequency": 501
    }
  ]
}
*/
