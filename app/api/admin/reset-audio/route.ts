import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { unlink, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/**
 * DELETE endpoint to reset all TTS audio cache
 * This clears both the database references and deletes the MP3 files
 */
export async function DELETE(request: Request) {
    try {
        // Clear all audioUrl references in database
        await prisma.vocabulary.updateMany({
            data: { audioUrl: null },
        });

        // Delete all MP3 files from public/audio directory
        const audioDir = path.join(process.cwd(), 'public', 'audio');

        if (existsSync(audioDir)) {
            const files = await readdir(audioDir);
            const mp3Files = files.filter(file => file.endsWith('.mp3'));

            for (const file of mp3Files) {
                const filePath = path.join(audioDir, file);
                await unlink(filePath);
            }

            return NextResponse.json({
                message: 'Audio cache cleared successfully',
                filesDeleted: mp3Files.length,
            });
        }

        return NextResponse.json({
            message: 'Audio cache cleared successfully',
            filesDeleted: 0,
        });
    } catch (error) {
        console.error('Error clearing audio cache:', error);
        return NextResponse.json(
            { error: 'Failed to clear audio cache' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
