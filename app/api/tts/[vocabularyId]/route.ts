import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Initialize Google Cloud TTS client
const ttsClient = new TextToSpeechClient({
    apiKey: process.env.GOOGLE_CLOUD_API_KEY,
});

export async function GET(
    request: Request,
    { params }: { params: { vocabularyId: string } }
) {
    try {
        const { vocabularyId } = params;

        // Fetch vocabulary item from database
        const vocabulary = await prisma.vocabulary.findUnique({
            where: { id: vocabularyId },
        });

        if (!vocabulary) {
            return NextResponse.json(
                { error: 'Vocabulary not found' },
                { status: 404 }
            );
        }

        // Check if audio already exists in database
        if (vocabulary.audioUrl) {
            return NextResponse.json({
                audioUrl: `/audio/${vocabulary.audioUrl}`,
                cached: true,
            });
        }

        // Generate audio filename (sanitize the Italian word for filesystem)
        const sanitizedWord = vocabulary.italian
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_');
        const audioFilename = `${sanitizedWord}_${vocabularyId.slice(0, 8)}.mp3`;
        const audioPath = path.join(process.cwd(), 'public', 'audio', audioFilename);

        // Ensure audio directory exists
        const audioDir = path.join(process.cwd(), 'public', 'audio');
        if (!existsSync(audioDir)) {
            await mkdir(audioDir, { recursive: true });
        }

        // Call Google Cloud TTS API
        // Available Italian voices:
        // - it-IT-Standard-A (Female, standard quality)
        // - it-IT-Standard-B (Female, standard quality) 
        // - it-IT-Wavenet-A (Female, premium quality)
        // - it-IT-Wavenet-B (Female, premium quality)
        // - it-IT-Wavenet-C (Male, premium quality)
        // - it-IT-Wavenet-D (Male, premium quality)
        const [response] = await ttsClient.synthesizeSpeech({
            input: { text: vocabulary.italian },
            voice: {
                languageCode: 'it-IT',
                name: 'it-IT-Wavenet-D', // Male Italian voice (change to -A for female)
                ssmlGender: 'MALE', // or 'FEMALE'
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 0.85, // Slower for language learning (0.25 to 4.0)
                pitch: 0, // -20.0 to 20.0
            },
        });

        // Save audio to file
        if (response.audioContent) {
            await writeFile(audioPath, response.audioContent, 'binary');
        } else {
            throw new Error('No audio content received from Google Cloud');
        }

        // Update database with audio filename
        await prisma.vocabulary.update({
            where: { id: vocabularyId },
            data: { audioUrl: audioFilename },
        });

        return NextResponse.json({
            audioUrl: `/audio/${audioFilename}`,
            cached: false,
        });
    } catch (error) {
        console.error('TTS API Error:', error);

        // Provide helpful error message if API key is missing
        if (error instanceof Error && error.message.includes('API key')) {
            return NextResponse.json(
                { error: 'Google Cloud API key not configured. Please add GOOGLE_CLOUD_API_KEY to your .env file.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to generate audio: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
