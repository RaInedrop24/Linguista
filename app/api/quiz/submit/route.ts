import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateNextReview, getQualityScore } from '@/lib/srs';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { progressId, knew, mode } = await request.json();

    if (mode === 'practice') {
      return NextResponse.json({
        success: true,
        practice: true,
      });
    }

    if (!progressId || knew === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch current progress
    const progress = await prisma.userProgress.findUnique({
      where: { id: progressId },
    });

    if (!progress || progress.userId !== userId) {
      return NextResponse.json(
        { error: 'Progress not found or unauthorized' },
        { status: 404 }
      );
    }

    // Calculate next review using SRS algorithm
    const qualityScore = getQualityScore(knew);
    const result = calculateNextReview(progress.boxLevel, qualityScore);

    // Update progress
    await prisma.userProgress.update({
      where: { id: progressId },
      data: {
        boxLevel: result.newBoxLevel,
        nextReviewDate: result.nextReviewDate,
        lastQualityScore: qualityScore,
        reviewCount: progress.reviewCount + 1,
        correctCount: result.isCorrect
          ? progress.correctCount + 1
          : progress.correctCount,
        incorrectCount: result.isCorrect
          ? progress.incorrectCount
          : progress.incorrectCount + 1,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      newBoxLevel: result.newBoxLevel,
      nextReviewDate: result.nextReviewDate,
    });
  } catch (error) {
    console.error('Error submitting quiz answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}
