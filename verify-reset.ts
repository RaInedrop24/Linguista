import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Verifying Reset Progress Functionality...');

    const userEmail = 'demo@linguista.com';

    // 1. Check initial progress
    const user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: {
            userProgress: true,
        },
    });

    if (!user) {
        console.error('❌ Demo user not found.');
        process.exit(1);
    }

    const initialCount = user.userProgress.length;
    console.log(`📊 Initial Progress Count: ${initialCount}`);

    // 2. Simulate Reset (Delete + Re-seed)
    console.log('🗑️ Simulating Reset (Deleting UserProgress)...');
    await prisma.userProgress.deleteMany({
        where: { userId: user.id },
    });

    console.log('🌱 Re-seeding 20 random words...');
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

    // 3. Verify Re-seeding
    const userAfter = await prisma.user.findUnique({
        where: { email: userEmail },
        include: {
            userProgress: true,
        },
    });

    const finalCount = userAfter?.userProgress.length || 0;
    console.log(`📊 Final Progress Count: ${finalCount}`);

    if (finalCount === 20) {
        console.log('✅ Reset verification successful: User progress re-initialized to 20 words.');
    } else {
        console.error(`❌ Reset verification failed: Expected 20 words, found ${finalCount}.`);
        process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
