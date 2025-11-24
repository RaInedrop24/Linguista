import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container mx-auto px-4 pt-20 pb-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-semibold tracking-wide uppercase">
              Learn Italian Faster
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-gray-900 dark:text-white">
              Master Italian with <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-accent-600">
                Spaced Repetition
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Linguista uses advanced algorithms to schedule reviews at the perfect time, ensuring you remember what you learn forever.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {session ? (
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition transform hover:scale-105 font-bold text-lg shadow-lg hover:shadow-brand-500/30"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-8 py-4 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition transform hover:scale-105 font-bold text-lg shadow-lg hover:shadow-brand-500/30"
                  >
                    Start Learning Now
                  </Link>
                  <Link
                    href="/register"
                    className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition transform hover:scale-105 font-bold text-lg shadow-sm"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-10">
            <div className="group p-8 rounded-3xl bg-gray-50 dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-gray-700/50 transition duration-300">
              <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900/50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition duration-300">
                📚
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                Curated Vocabulary
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Learn the most common Italian words with example sentences and conjugations, hand-picked for rapid fluency.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-gray-50 dark:bg-gray-800 hover:bg-accent-50 dark:hover:bg-gray-700/50 transition duration-300">
              <div className="w-14 h-14 bg-accent-100 dark:bg-accent-900/50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition duration-300">
                🧠
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                Smart Algorithm
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Our spaced repetition system (SRS) predicts when you're about to forget a word and schedules a review instantly.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-gray-50 dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-gray-700/50 transition duration-300">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition duration-300">
                🎯
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                Track Progress
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Watch your vocabulary grow with detailed statistics, daily streaks, and mastery levels for every word.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
