'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Flashcard } from '@/components/Flashcard';
import Link from 'next/link';

interface VocabularyItem {
  id: string;
  italian: string;
  english: string;
  exampleSentence: string;
  partOfSpeech: string;
  progressId: string;
}

export default function QuizPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const isPractice = mode === 'practice';

  const [words, setWords] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDueWords();
    }
  }, [status, mode]);

  const fetchDueWords = async () => {
    try {
      const response = await fetch(`/api/quiz/due-words?mode=${mode || ''}`);
      const data = await response.json();
      setWords(data.words);
      setLoading(false);

      if (data.words.length === 0) {
        setCompleted(true);
      }
    } catch (error) {
      console.error('Error fetching due words:', error);
      setLoading(false);
    }
  };

  const handleAnswer = async (knew: boolean) => {
    if (submitting || !words[currentIndex]) return;

    setSubmitting(true);
    const currentWord = words[currentIndex];

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progressId: currentWord.progressId,
          knew,
          mode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      // Update stats
      setStats((prev) => ({
        correct: knew ? prev.correct + 1 : prev.correct,
        total: prev.total + 1,
      }));

      // Move to next word
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCompleted(true);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (completed || words.length === 0) {
    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-2xl text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {words.length === 0 ? 'No words due!' : 'Quiz Complete!'}
          </h1>
          {words.length === 0 ? (
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              {isPractice
                ? "You've reviewed all available words. Great practice!"
                : "You've reviewed all your words for today. Great job! Come back later for more practice."}
            </p>
          ) : (
            <>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                {isPractice
                  ? "You've completed your practice session"
                  : "You've completed your review session"}
              </p>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.total}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                    {stats.correct}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-500">Correct</div>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">
                    {accuracy}%
                  </div>
                  <div className="text-sm text-indigo-600 dark:text-indigo-500">Accuracy</div>
                </div>
              </div>
            </>
          )}
          <Link
            href="/dashboard"
            className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold text-lg"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link
              href="/dashboard"
              className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition font-medium flex items-center gap-2"
            >
              <span>←</span> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              {isPractice && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 uppercase tracking-wide">
                  Practice Mode
                </span>
              )}
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
                Word {currentIndex + 1} of {words.length}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-500 to-brand-600 h-3 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(14,165,233,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Flashcard
          key={currentWord.id}
          vocabularyId={currentWord.id}
          italian={currentWord.italian}
          english={currentWord.english}
          exampleSentence={currentWord.exampleSentence}
          partOfSpeech={currentWord.partOfSpeech}
          onKnew={() => handleAnswer(true)}
          onDidntKnow={() => handleAnswer(false)}
        />

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 bg-white dark:bg-gray-800 px-8 py-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {stats.correct}
              </div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Correct</div>
            </div>
            <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                {stats.total - stats.correct}
              </div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Incorrect</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
