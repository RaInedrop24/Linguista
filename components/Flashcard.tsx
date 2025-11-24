'use client';

import { useState, useEffect } from 'react';

interface FlashcardProps {
  vocabularyId: string;
  italian: string;
  english: string;
  exampleSentence: string;
  partOfSpeech: string;
  onKnew: () => void;
  onDidntKnow: () => void;
  hasAudio?: boolean;
}

export function Flashcard({
  vocabularyId,
  italian,
  english,
  exampleSentence,
  partOfSpeech,
  onKnew,
  onDidntKnow,
  hasAudio = true,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [exampleEnglish, setExampleEnglish] = useState<string>('');

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Fetch English translation when card is flipped
  useEffect(() => {
    if (isFlipped && !exampleEnglish) {
      fetch(`/api/translate/example/${vocabularyId}`)
        .then(res => res.json())
        .then(data => {
          if (data.english) {
            setExampleEnglish(data.english);
          }
        })
        .catch(err => console.error('Failed to load translation:', err));
    }
  }, [isFlipped, vocabularyId, exampleEnglish]);

  const handleAudio = async () => {
    if (!hasAudio) return;

    try {
      setIsPlaying(true);

      // Fetch audio from TTS API
      const response = await fetch(`/api/tts/${vocabularyId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load audio');
      }

      const data = await response.json();

      // Create and play audio
      const audio = new Audio(data.audioUrl);

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        alert('Failed to play audio. Please try again.');
      };

      await audio.play();
    } catch (error) {
      console.error('Audio error:', error);
      setIsPlaying(false);
      alert(error instanceof Error ? error.message : 'Failed to play audio');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transition-all duration-300 ${isFlipped ? 'min-h-[400px]' : 'min-h-[300px]'
          }`}
      >
        {!isFlipped ? (
          // Front of card - Italian word
          <div className="p-12 flex flex-col items-center justify-center min-h-[300px]">
            <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
              {partOfSpeech}
            </div>
            <h2 className="text-6xl font-bold text-gray-900 dark:text-white mb-8">
              {italian}
            </h2>
            <button
              onClick={handleAudio}
              disabled={!hasAudio || isPlaying}
              className={`flex items-center gap-2 px-8 py-4 rounded-lg transition min-h-[44px] ${hasAudio
                ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 hover:bg-brand-200 dark:hover:bg-brand-900/50 active:scale-95'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
            >
              <span className="text-2xl">🔊</span>
              <span className="font-medium text-base">
                {isPlaying ? 'Playing...' : 'Listen'}
              </span>
            </button>
            <button
              onClick={handleFlip}
              className="mt-8 px-8 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium min-h-[44px] active:scale-95"
            >
              Show Answer
            </button>
          </div>
        ) : (
          // Back of card - English translation and example
          <div className="p-12 flex flex-col min-h-[400px]">
            <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              {partOfSpeech}
            </div>
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {italian}
            </h2>
            <div className="text-3xl text-brand-600 dark:text-brand-400 font-semibold mb-6">
              {english}
            </div>
            <div className="flex-grow">
              {exampleSentence && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                  <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Example
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    <span className="italic">"{exampleSentence}"</span>
                    {exampleEnglish && (
                      <>
                        <br />
                        <span className="text-gray-500 dark:text-gray-400">— </span>
                        <span className="text-gray-600 dark:text-gray-400">"{exampleEnglish}"</span>
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-8 flex gap-4">
              <button
                onClick={onDidntKnow}
                className="flex-1 px-6 py-5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition font-semibold text-lg border border-red-100 dark:border-red-900/50 min-h-[56px] active:scale-95"
              >
                I didn&apos;t know it
              </button>
              <button
                onClick={onKnew}
                className="flex-1 px-6 py-5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition font-semibold text-lg border border-green-100 dark:border-green-900/50 min-h-[56px] active:scale-95"
              >
                I knew it
              </button>
            </div>
          </div>
        )}
      </div>

      {!isFlipped && (
        <div className="text-center mt-6 text-gray-500 dark:text-gray-400">
          <p className="text-sm font-medium">Click &quot;Show Answer&quot; to reveal the translation</p>
        </div>
      )}
    </div>
  );
}
