import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface VocabularyItem {
  word: string;
  english_translation: string;
  pos: string;
  example_sentence_native: string;
  word_frequency: number;
}

// Conjugations for essere (to be) - Presente
const essereConjugations = [
  { tense: 'Presente', person: 'io', form: 'sono' },
  { tense: 'Presente', person: 'tu', form: 'sei' },
  { tense: 'Presente', person: 'lui/lei', form: 'è' },
  { tense: 'Presente', person: 'noi', form: 'siamo' },
  { tense: 'Presente', person: 'voi', form: 'siete' },
  { tense: 'Presente', person: 'loro', form: 'sono' },
  { tense: 'Passato Prossimo', person: 'io', form: 'sono stato/a' },
  { tense: 'Passato Prossimo', person: 'tu', form: 'sei stato/a' },
  { tense: 'Passato Prossimo', person: 'lui/lei', form: 'è stato/a' },
  { tense: 'Passato Prossimo', person: 'noi', form: 'siamo stati/e' },
  { tense: 'Passato Prossimo', person: 'voi', form: 'siete stati/e' },
  { tense: 'Passato Prossimo', person: 'loro', form: 'sono stati/e' },
  { tense: 'Futuro', person: 'io', form: 'sarò' },
  { tense: 'Futuro', person: 'tu', form: 'sarai' },
  { tense: 'Futuro', person: 'lui/lei', form: 'sarà' },
  { tense: 'Futuro', person: 'noi', form: 'saremo' },
  { tense: 'Futuro', person: 'voi', form: 'sarete' },
  { tense: 'Futuro', person: 'loro', form: 'saranno' },
];

// Conjugations for avere (to have) - Presente
const avereConjugations = [
  { tense: 'Presente', person: 'io', form: 'ho' },
  { tense: 'Presente', person: 'tu', form: 'hai' },
  { tense: 'Presente', person: 'lui/lei', form: 'ha' },
  { tense: 'Presente', person: 'noi', form: 'abbiamo' },
  { tense: 'Presente', person: 'voi', form: 'avete' },
  { tense: 'Presente', person: 'loro', form: 'hanno' },
  { tense: 'Passato Prossimo', person: 'io', form: 'ho avuto' },
  { tense: 'Passato Prossimo', person: 'tu', form: 'hai avuto' },
  { tense: 'Passato Prossimo', person: 'lui/lei', form: 'ha avuto' },
  { tense: 'Passato Prossimo', person: 'noi', form: 'abbiamo avuto' },
  { tense: 'Passato Prossimo', person: 'voi', form: 'avete avuto' },
  { tense: 'Passato Prossimo', person: 'loro', form: 'hanno avuto' },
  { tense: 'Futuro', person: 'io', form: 'avrò' },
  { tense: 'Futuro', person: 'tu', form: 'avrai' },
  { tense: 'Futuro', person: 'lui/lei', form: 'avrà' },
  { tense: 'Futuro', person: 'noi', form: 'avremo' },
  { tense: 'Futuro', person: 'voi', form: 'avrete' },
  { tense: 'Futuro', person: 'loro', form: 'avranno' },
];

// Conjugations for fare (to do/make) - Presente
const fareConjugations = [
  { tense: 'Presente', person: 'io', form: 'faccio' },
  { tense: 'Presente', person: 'tu', form: 'fai' },
  { tense: 'Presente', person: 'lui/lei', form: 'fa' },
  { tense: 'Presente', person: 'noi', form: 'facciamo' },
  { tense: 'Presente', person: 'voi', form: 'fate' },
  { tense: 'Presente', person: 'loro', form: 'fanno' },
  { tense: 'Passato Prossimo', person: 'io', form: 'ho fatto' },
  { tense: 'Passato Prossimo', person: 'tu', form: 'hai fatto' },
  { tense: 'Passato Prossimo', person: 'lui/lei', form: 'ha fatto' },
  { tense: 'Passato Prossimo', person: 'noi', form: 'abbiamo fatto' },
  { tense: 'Passato Prossimo', person: 'voi', form: 'avete fatto' },
  { tense: 'Passato Prossimo', person: 'loro', form: 'hanno fatto' },
  { tense: 'Futuro', person: 'io', form: 'farò' },
  { tense: 'Futuro', person: 'tu', form: 'farai' },
  { tense: 'Futuro', person: 'lui/lei', form: 'farà' },
  { tense: 'Futuro', person: 'noi', form: 'faremo' },
  { tense: 'Futuro', person: 'voi', form: 'farete' },
  { tense: 'Futuro', person: 'loro', form: 'faranno' },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@linguista.com' },
    update: {},
    create: {
      email: 'demo@linguista.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });
  console.log('✅ Created/Found demo user:', demoUser.email);

  // Read vocabulary from JSON file
  console.log('📚 Reading vocabulary from file...');
  const vocabFilePath = path.join(__dirname, 'italian-vocabulary.json');
  const vocabFileContent = fs.readFileSync(vocabFilePath, 'utf-8');
  const vocabularyList: VocabularyItem[] = JSON.parse(vocabFileContent);

  // Filter and map vocabulary (take top 600)
  const topVocabulary = vocabularyList
    .sort((a, b) => a.word_frequency - b.word_frequency)
    .slice(0, 600)
    .map((item) => ({
      italian: item.word,
      english: item.english_translation.split(';')[0], // Take first translation
      pos: item.pos,
      example: item.example_sentence_native,
      freq: item.word_frequency,
    }));

  console.log(`📚 Seeding ${topVocabulary.length} vocabulary items...`);
  const vocabularyIds: { [key: string]: string } = {};

  for (const vocab of topVocabulary) {
    const existing = await prisma.vocabulary.findFirst({
      where: { italian: vocab.italian },
    });

    if (existing) {
      vocabularyIds[vocab.italian] = existing.id;
    } else {
      const created = await prisma.vocabulary.create({
        data: {
          italian: vocab.italian,
          english: vocab.english,
          partOfSpeech: vocab.pos,
          exampleSentence: vocab.example,
          frequency: vocab.freq,
          source: 'seed-v2',
        },
      });
      vocabularyIds[vocab.italian] = created.id;
    }
  }
  console.log(`✅ Seeded vocabulary items`);

  // Add conjugations for key verbs
  console.log('📝 Adding verb conjugations...');

  if (vocabularyIds['essere']) {
    for (const conj of essereConjugations) {
      await prisma.conjugation.create({
        data: {
          vocabularyId: vocabularyIds['essere'],
          tense: conj.tense,
          person: conj.person,
          form: conj.form,
        },
      });
    }
  }

  if (vocabularyIds['avere']) {
    for (const conj of avereConjugations) {
      await prisma.conjugation.create({
        data: {
          vocabularyId: vocabularyIds['avere'],
          tense: conj.tense,
          person: conj.person,
          form: conj.form,
        },
      });
    }
  }

  if (vocabularyIds['fare']) {
    for (const conj of fareConjugations) {
      await prisma.conjugation.create({
        data: {
          vocabularyId: vocabularyIds['fare'],
          tense: conj.tense,
          person: conj.person,
          form: conj.form,
        },
      });
    }
  }
  console.log('✅ Created conjugations for essere, avere, and fare');

  // Initialize user progress for the demo user with a MIXED set of 20 words
  console.log('🎯 Initializing user progress...');

  // Check if user already has progress
  const existingProgress = await prisma.userProgress.count({
    where: { userId: demoUser.id },
  });

  if (existingProgress === 0) {
    // Select 20 random words from the top 100 to ensure variety
    const top100 = topVocabulary.slice(0, 100);
    const shuffled = top100.sort(() => 0.5 - Math.random());
    const selectedWords = shuffled.slice(0, 20);

    for (const vocab of selectedWords) {
      if (vocabularyIds[vocab.italian]) {
        await prisma.userProgress.create({
          data: {
            userId: demoUser.id,
            vocabularyId: vocabularyIds[vocab.italian],
            boxLevel: 1,
            nextReviewDate: new Date(),
            lastQualityScore: 0,
            reviewCount: 0,
            correctCount: 0,
            incorrectCount: 0,
          },
        });
      }
    }
    console.log(`✅ Initialized progress tracking for ${selectedWords.length} mixed words`);
  } else {
    console.log('ℹ️ User progress already exists, skipping initialization');
  }

  console.log('');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
