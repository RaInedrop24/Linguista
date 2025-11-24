import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Verifying Vocabulary Expansion...');

    // 1. Count total vocabulary
    const totalVocab = await prisma.vocabulary.count();
    console.log(`📚 Total Vocabulary Items: ${totalVocab}`);

    // 2. Count by Part of Speech
    const posCounts = await prisma.vocabulary.groupBy({
        by: ['partOfSpeech'],
        _count: {
            id: true,
        },
    });
    console.log('📊 Vocabulary by Part of Speech:');
    posCounts.forEach((group) => {
        console.log(`   - ${group.partOfSpeech}: ${group._count.id}`);
    });

    // 3. Check Demo User Progress
    const demoUser = await prisma.user.findUnique({
        where: { email: 'demo@linguista.com' },
        include: {
            userProgress: {
                include: {
                    vocabulary: true,
                },
            },
        },
    });

    if (demoUser) {
        console.log(`👤 Demo User Progress Count: ${demoUser.userProgress.length}`);
        console.log('   Sample words in progress:');
        demoUser.userProgress.slice(0, 5).forEach((p) => {
            console.log(`   - ${p.vocabulary.italian} (${p.vocabulary.partOfSpeech})`);
        });

        // If progress is small (e.g. < 25), add more mixed words
        if (demoUser.userProgress.length < 25) {
            console.log('⚠️ Demo user has limited progress. Adding more mixed words...');

            const existingIds = demoUser.userProgress.map(p => p.vocabularyId);

            // Fetch some nouns and adjectives
            const newWords = await prisma.vocabulary.findMany({
                where: {
                    id: { notIn: existingIds },
                    partOfSpeech: { in: ['noun', 'adjective'] }
                },
                take: 20,
            });

            console.log(`   Found ${newWords.length} new words to add.`);

            for (const word of newWords) {
                await prisma.userProgress.create({
                    data: {
                        userId: demoUser.id,
                        vocabularyId: word.id,
                        boxLevel: 1,
                        nextReviewDate: new Date(),
                    },
                });
            }
            console.log('✅ Added mixed words to demo user progress.');
        }
    } else {
        console.log('❌ Demo user not found.');
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
