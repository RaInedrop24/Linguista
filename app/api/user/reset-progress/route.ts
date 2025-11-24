import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Delete all progress for this user
        await prisma.userProgress.deleteMany({
            where: { userId: user.id },
        });

        // Re-initialize with 20 random words (simulate "Day 1")
        const topVocabulary = await prisma.vocabulary.findMany({
            take: 100,
            orderBy: { frequency: 'asc' },
        });

        const shuffled = topVocabulary.sort(() => 0.5 - Math.random());
        const selectedWords = shuffled.slice(0, 20);

        for (const vocab of selectedWords) {
            await prisma.userProgress.create({
                data: {
                    userId: user.id,
                    vocabularyId: vocab.id,
                    boxLevel: 1,
                    nextReviewDate: new Date(),
                    lastQualityScore: 0,
                    reviewCount: 0,
                    correctCount: 0,
                    incorrectCount: 0,
                },
            });
        }

        return NextResponse.json({ message: 'Progress reset successfully' });
    } catch (error) {
        console.error('Error resetting progress:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
