import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v2 } from '@google-cloud/translate';

const prisma = new PrismaClient();
const translate = new v2.Translate({
    key: process.env.GOOGLE_CLOUD_API_KEY,
});

/**
 * Helper endpoint to get or translate example sentences
 * GET /api/translate/example/[vocabularyId]
 */
export async function GET(
    request: Request,
    { params }: { params: { vocabularyId: string } }
) {
    try {
        const { vocabularyId } = params;

        // Fetch vocabulary
        const vocabulary = await prisma.vocabulary.findUnique({
            where: { id: vocabularyId },
        });

        if (!vocabulary) {
            return NextResponse.json(
                { error: 'Vocabulary not found' },
                { status: 404 }
            );
        }

        // Return cached translation if exists
        if (vocabulary.exampleSentenceEnglish) {
            return NextResponse.json({
                italian: vocabulary.exampleSentence,
                english: vocabulary.exampleSentenceEnglish,
                cached: true,
            });
        }

        // Translate the Italian example to English
        if (!vocabulary.exampleSentence) {
            return NextResponse.json({
                italian: '',
                english: '',
                cached: false,
            });
        }

        const [translation] = await translate.translate(
            vocabulary.exampleSentence,
            { from: 'it', to: 'en' }
        );

        // Cache the translation in database
        await prisma.vocabulary.update({
            where: { id: vocabularyId },
            data: { exampleSentenceEnglish: translation },
        });

        return NextResponse.json({
            italian: vocabulary.exampleSentence,
            english: translation,
            cached: false,
        });
    } catch (error) {
        console.error('Translation error:', error);

        // Return untranslated if error
        return NextResponse.json(
            { error: 'Translation failed', italian: '', english: '' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
