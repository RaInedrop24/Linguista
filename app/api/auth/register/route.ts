import { NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Initialize user progress with first 20 vocabulary items
    const vocabularyItems = await prisma.vocabulary.findMany({
      take: 20,
      orderBy: { frequency: 'asc' },
    });

    await prisma.userProgress.createMany({
      data: vocabularyItems.map((vocab) => ({
        userId: user.id,
        vocabularyId: vocab.id,
        boxLevel: 1,
        nextReviewDate: new Date(),
        lastQualityScore: 0,
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
      })),
    });

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
