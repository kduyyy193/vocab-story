
import React, { useState, useEffect } from 'react';
import { useVocabulary } from '../hooks/useVocabulary';
import Flashcard from './Flashcard';
import { Word } from '../types';
import { ReviewAction } from '../constants';

const LearnScreen: React.FC = () => {
    const { getWordsToLearn, updateWordProgress, markAsMastered } = useVocabulary();
    const [wordsToLearn, setWordsToLearn] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        setWordsToLearn(getWordsToLearn().slice(0, 10)); // Learn in batches of 10
        setCurrentIndex(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNextWord = (action: ReviewAction) => {
        if (currentIndex >= wordsToLearn.length) return;
        updateWordProgress(wordsToLearn[currentIndex].id, action);
        if (currentIndex < wordsToLearn.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // End of batch
            setWordsToLearn(getWordsToLearn().slice(0, 10));
            setCurrentIndex(0);
        }
    };
    
    const handleMastered = () => {
        if (currentIndex >= wordsToLearn.length) return;
        markAsMastered(wordsToLearn[currentIndex].id);
         if (currentIndex < wordsToLearn.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setWordsToLearn(getWordsToLearn().slice(0, 10));
            setCurrentIndex(0);
        }
    }

    if (wordsToLearn.length === 0 || currentIndex >= wordsToLearn.length) {
        return (
            <div className="text-center p-8 bg-white dark:bg-dark-card rounded-lg shadow-md animate-fade-in">
                <h2 className="text-2xl font-bold text-primary mb-4">Great job!</h2>
                <p className="text-gray-600 dark:text-dark-text-secondary">You have learned all the new words for now. Come back later for more!</p>
            </div>
        );
    }
    
    const currentWord = wordsToLearn[currentIndex];

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-dark-text">Learn New Words ({currentIndex + 1}/{wordsToLearn.length})</h2>
            <Flashcard key={currentWord.id} word={currentWord} />
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
                 <button onClick={() => handleNextWord(ReviewAction.Again)} className="w-full sm:w-auto px-6 py-3 bg-danger text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300">
                    Needs Review
                </button>
                <button onClick={() => handleNextWord(ReviewAction.Good)} className="w-full sm:w-auto px-6 py-3 bg-success text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300">
                    Got It!
                </button>
                <button onClick={handleMastered} className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-colors duration-300">
                   Already Know
                </button>
            </div>
        </div>
    );
};

export default LearnScreen;
