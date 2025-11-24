import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const now = new Date();

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    let dueProgress;

    if (mode === 'practice') {
      // For practice mode, fetch random words (or just 20 words)
      // Since Prisma doesn't support random() natively easily without raw query,
      // we'll just fetch 20 words that haven't been reviewed recently or just any 20.
      // For simplicity, let's fetch 20 words ordered by last review date (oldest first)
      dueProgress = await prisma.userProgress.findMany({
        where: { userId },
        include: { vocabulary: true },
        orderBy: { updatedAt: 'asc' },
        take: 20,
      });

      // If we want true randomness we could fetch IDs and pick random ones, 
      // but "oldest reviewed" is a good proxy for "needs practice".
    } else {
      // Normal mode: Fetch words that are due for review
      dueProgress = await prisma.userProgress.findMany({
        where: {
          userId,
          nextReviewDate: {
            lte: now,
          },
        },
        include: {
          vocabulary: true,
        },
        orderBy: {
          nextReviewDate: 'asc',
        },
        take: 20, // Limit to 20 words per session
      });
    }

    const words = dueProgress.map((progress) => ({
      id: progress.vocabulary.id,
      italian: progress.vocabulary.italian,
      english: progress.vocabulary.english,
      exampleSentence: progress.vocabulary.exampleSentence,
      partOfSpeech: progress.vocabulary.partOfSpeech,
      progressId: progress.id,
    }));

    return NextResponse.json({ words });
  } catch (error) {
    console.error('Error fetching due words:', error);
    return NextResponse.json(
      { error: 'Failed to fetch due words' },
      { status: 500 }
    );
  }
}
