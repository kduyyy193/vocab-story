
import React, { useState, useEffect, useMemo } from 'react';
import { useVocabulary } from '../hooks/useVocabulary';
import Flashcard from './Flashcard';
import { Word } from '../types';
import { ReviewAction } from '../constants';
import { CheckIcon, XIcon } from './icons';

type SessionState = 'setup' | 'in_progress' | 'finished';
type ReviewType = 'all_due' | 'quick_10';

const ReviewScreen: React.FC = () => {
    const { getWordsToReview, updateWordProgress } = useVocabulary();
    
    const [sessionState, setSessionState] = useState<SessionState>('setup');
    const [reviewQueue, setReviewQueue] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [userAnswer, setUserAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const allWordsToReview = useMemo(getWordsToReview, [getWordsToReview]);

    const startSession = (type: ReviewType) => {
        let queue: Word[] = [];
        if (type === 'quick_10') {
            queue = allWordsToReview.slice(0, 10);
        } else {
            queue = allWordsToReview;
        }
        setReviewQueue(queue);
        setCurrentIndex(0);
        setUserAnswer('');
        setShowResult(false);
        setIsCorrect(null);
        setSessionState(queue.length > 0 ? 'in_progress' : 'finished');
    };

    const handleCheckAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userAnswer) return;
        
        const correct = userAnswer.trim().toLowerCase() === reviewQueue[currentIndex].word.toLowerCase();
        setIsCorrect(correct);
        setShowResult(true);
    };

    const handleReviewAction = (action: ReviewAction) => {
        if (currentIndex >= reviewQueue.length) return;
        
        // If the answer was wrong, it should be treated as "Again", regardless of button pressed.
        const finalAction = isCorrect === false ? ReviewAction.Again : action;
        updateWordProgress(reviewQueue[currentIndex].id, finalAction);

        if (currentIndex < reviewQueue.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setUserAnswer('');
            setShowResult(false);
            setIsCorrect(null);
        } else {
            setSessionState('finished');
        }
    };
    
    // Initial Setup View
    if (sessionState === 'setup') {
        return (
            <div className="max-w-xl mx-auto text-center p-8 bg-white dark:bg-dark-card rounded-lg shadow-md animate-fade-in">
                 <h2 className="text-2xl font-bold text-primary mb-2">Review Session</h2>
                 <p className="text-gray-600 dark:text-dark-text-secondary mb-6">You have {allWordsToReview.length} words ready for review.</p>
                 {allWordsToReview.length > 0 ? (
                    <div className="space-y-4">
                        <button 
                            onClick={() => startSession('all_due')}
                            className="w-full px-6 py-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-colors duration-300"
                        >
                            Review All ({allWordsToReview.length} words)
                        </button>
                         <button 
                            onClick={() => startSession('quick_10')}
                            className="w-full px-6 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-hover transition-colors duration-300"
                        >
                            Quick Session (10 words)
                        </button>
                    </div>
                 ) : (
                    <p className="text-lg text-gray-700 dark:text-dark-text">Excellent work! You are all caught up.</p>
                 )}
            </div>
        )
    }

    if (sessionState === 'finished' || reviewQueue.length === 0) {
        return (
            <div className="text-center p-8 bg-white dark:bg-dark-card rounded-lg shadow-md animate-fade-in">
                <h2 className="text-2xl font-bold text-primary mb-4">All Caught Up!</h2>
                <p className="text-gray-600 dark:text-dark-text-secondary">You have finished your review session. Excellent work!</p>
                 <button 
                    onClick={() => setSessionState('setup')}
                    className="mt-6 px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-colors duration-300"
                >
                    Start Another Session
                </button>
            </div>
        );
    }
    
    const currentWord = reviewQueue[currentIndex];

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
             <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-dark-text">Review Session ({currentIndex + 1}/{reviewQueue.length})</h2>
            
            {!showResult ? (
                <div className="p-8 bg-white dark:bg-dark-card rounded-lg shadow-lg text-center">
                    <p className="text-lg text-gray-500 dark:text-dark-text-secondary">What is the English word for:</p>
                    <h3 className="text-4xl font-bold text-primary my-4">{currentWord.meaning}</h3>
                    <form onSubmit={handleCheckAnswer} className="mt-6 flex gap-2">
                        <input 
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className="flex-grow p-3 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-bg text-gray-800 dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Type the word here..."
                            autoFocus
                            autoCapitalize="none"
                        />
                        <button type="submit" className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-colors duration-300">
                            Check
                        </button>
                    </form>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className={`p-4 rounded-lg flex items-center justify-center gap-2 text-lg font-semibold ${isCorrect ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                        {isCorrect ? <CheckIcon /> : <XIcon />}
                        <span>{isCorrect ? 'Correct!' : `Not quite. The answer is: ${currentWord.word}`}</span>
                    </div>

                    <Flashcard key={currentWord.id} word={currentWord} isFlippedInitially={true} />
                    
                    <p className="text-center text-gray-600 dark:text-dark-text-secondary">How well did you know this word?</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <button onClick={() => handleReviewAction(ReviewAction.Again)} className="w-full px-4 py-3 bg-danger text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300">
                            Again
                        </button>
                        <button onClick={() => handleReviewAction(ReviewAction.Hard)} className="w-full px-4 py-3 bg-warning text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition-colors duration-300">
                            Hard
                        </button>
                        <button onClick={() => handleReviewAction(ReviewAction.Good)} className="w-full px-4 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-hover transition-colors duration-300">
                            Good
                        </button>
                        <button onClick={() => handleReviewAction(ReviewAction.Easy)} className="w-full px-4 py-3 bg-success text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300">
                        Easy
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewScreen;