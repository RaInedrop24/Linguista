import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';
import ResetProgressButton from '@/components/ResetProgressButton';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  // Get user progress stats
  const userProgress = await prisma.userProgress.findMany({
    where: { userId },
    include: { vocabulary: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueForReview = userProgress.filter(
    (p) => new Date(p.nextReviewDate) <= new Date()
  ).length;

  const totalWords = userProgress.length;
  const reviewedToday = userProgress.filter((p) => {
    const lastUpdate = new Date(p.updatedAt);
    return lastUpdate >= today;
  }).length;

  const boxStats = {
    box1: userProgress.filter((p) => p.boxLevel === 1).length,
    box2: userProgress.filter((p) => p.boxLevel === 2).length,
    box3: userProgress.filter((p) => p.boxLevel === 3).length,
    box4: userProgress.filter((p) => p.boxLevel === 4).length,
    box5: userProgress.filter((p) => p.boxLevel === 5).length,
  };

  const totalCorrect = userProgress.reduce((sum, p) => sum + p.correctCount, 0);
  const totalReviews = userProgress.reduce((sum, p) => sum + p.reviewCount, 0);
  const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇮🇹</span>
            <span className="font-bold text-xl text-gray-900 dark:text-white">Linguista</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {session.user.name}
            </span>
            <SignOutButton />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back! Here&apos;s your progress overview.
            </p>
          </div>

          {dueForReview > 0 ? (
            <div className="bg-gradient-to-r from-brand-600 to-brand-500 text-white p-8 rounded-2xl shadow-lg mb-10 transform transition hover:scale-[1.01]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {dueForReview} {dueForReview === 1 ? 'word' : 'words'} ready for review!
                  </h2>
                  <p className="text-brand-100 text-lg">
                    Keep your streak alive by reviewing your daily words.
                  </p>
                </div>
                <Link
                  href="/quiz"
                  className="px-8 py-3 bg-white text-brand-600 rounded-xl hover:bg-brand-50 transition font-bold text-lg shadow-md whitespace-nowrap"
                >
                  Start Learning
                </Link>
              </div>
            </div>
          ) : totalWords === 0 ? (
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-8 rounded-2xl shadow-lg mb-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Welcome to Linguista!
                  </h2>
                  <p className="text-gray-300 text-lg">
                    It looks like you have no words yet. Please use the <span className="font-bold text-red-400">Reset Progress</span> button below to initialize your account with a starter set of words.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-2xl">📚</div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {totalWords}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Words</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-2xl">⏰</div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {dueForReview}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Due Today</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl text-2xl">✅</div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {reviewedToday}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Reviewed Today</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-2xl">🎯</div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {accuracy}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Accuracy</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span>📈</span> Learning Progress
              </h2>
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((box) => {
                  const count = boxStats[`box${box}` as keyof typeof boxStats];
                  const percentage = totalWords > 0 ? (count / totalWords) * 100 : 0;
                  const intervals = ['Daily', '2 days', '4 days', 'Weekly', '2 weeks'];
                  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-brand-500'];

                  return (
                    <div key={box}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${colors[box - 1]}`}></span>
                          Box {box} <span className="text-gray-400 font-normal">({intervals[box - 1]})</span>
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          {count} words
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${colors[box - 1]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <Link
                href="/quiz?mode=practice"
                className="block bg-white p-6 rounded-2xl shadow-sm border border-slate-100 dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Practice Quiz</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400">Review words without affecting your progress scores. Great for casual practice.</p>
              </Link>

              <Link
                href="/vocabulary"
                className="block bg-white p-6 rounded-2xl shadow-sm border border-slate-100 dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <span className="text-2xl">📖</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Vocabulary List</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400">Browse all your words and check your progress.</p>
              </Link>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-200 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Danger Zone</h3>
                <p className="text-sm text-slate-600 dark:text-gray-400">Irreversible actions for your account.</p>
              </div>
              <ResetProgressButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
