import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function VocabularyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  // Get all user progress with vocabulary
  const userProgress = await prisma.userProgress.findMany({
    where: { userId },
    include: { vocabulary: true },
    orderBy: { vocabulary: { frequency: 'asc' } },
  });

  const isDue = (date: Date) => {
    return new Date(date) <= new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Your Vocabulary
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Browse all {userProgress.length} words you&apos;re learning
            </p>

            {userProgress.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  You haven&apos;t started learning any words yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Italian
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        English
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Part of Speech
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Box Level
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Reviews
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Accuracy
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userProgress.map((progress) => {
                      const accuracy =
                        progress.reviewCount > 0
                          ? Math.round((progress.correctCount / progress.reviewCount) * 100)
                          : 0;
                      const due = isDue(progress.nextReviewDate);

                      return (
                        <tr
                          key={progress.id}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                        >
                          <td className="py-4 px-4">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {progress.vocabulary.italian}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                            {progress.vocabulary.english}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {progress.vocabulary.partOfSpeech}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                              {progress.boxLevel}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center text-gray-700 dark:text-gray-300">
                            {progress.reviewCount}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`font-semibold ${accuracy >= 80
                                  ? 'text-green-600 dark:text-green-400'
                                  : accuracy >= 60
                                    ? 'text-yellow-600 dark:text-yellow-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}
                            >
                              {progress.reviewCount > 0 ? `${accuracy}%` : '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {due ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                Due now
                              </span>
                            ) : (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Next review:</span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                  {new Date(progress.nextReviewDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProgress.filter((p) => isDue(p.nextReviewDate)).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Words Due</div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProgress.filter((p) => p.boxLevel === 5).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Mastered Words</div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProgress.reduce((sum, p) => sum + p.reviewCount, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
