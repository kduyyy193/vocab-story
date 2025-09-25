import React, { useState, useEffect, useMemo } from 'react';
import { useVocabulary } from '../hooks/useVocabulary';
import Flashcard from './Flashcard';
import { Word, LearningStatus } from '../types';
import { ReviewAction } from '../constants';
import { CheckIcon, XIcon, VolumeIcon } from './icons';

type SessionState = 'setup' | 'in_progress' | 'finished';
type SessionType = 'all' | 'quick_10';

const ListeningScreen: React.FC = () => {
    const { words, progress, updateWordProgress, settings } = useVocabulary();
    
    const [sessionState, setSessionState] = useState<SessionState>('setup');
    const [sessionQueue, setSessionQueue] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [userAnswer, setUserAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const knownWords = useMemo(() => {
        return words.filter(word => progress[word.id]?.status !== LearningStatus.NotLearned);
    }, [words, progress]);

    const startSession = (type: SessionType) => {
        let queue: Word[] = [];
        const shuffledWords = [...knownWords].sort(() => Math.random() - 0.5);
        if (type === 'quick_10') {
            queue = shuffledWords.slice(0, 10);
        } else {
            queue = shuffledWords;
        }
        setSessionQueue(queue);
        setCurrentIndex(0);
        setUserAnswer('');
        setShowResult(false);
        setIsCorrect(null);
        setSessionState(queue.length > 0 ? 'in_progress' : 'finished');
    };
    
    const handleSpeak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            let selectedVoice;

            if (settings.defaultVoice === 'UK') {
                 selectedVoice = voices.find(v => v.name.includes('Google UK English') || v.name.includes('British'));
            } else {
                 selectedVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('American'));
            }
            utterance.voice = selectedVoice || voices.find(v => v.lang.startsWith('en')) || voices[0];
            utterance.lang = settings.defaultVoice === 'UK' ? 'en-GB' : 'en-US';
            utterance.rate = settings.speechSpeed;
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Your browser does not support text-to-speech.');
        }
    };

    // Auto-play sound for the new word
    useEffect(() => {
        if (sessionState === 'in_progress' && sessionQueue.length > 0) {
            handleSpeak(sessionQueue[currentIndex].word);
        }
    }, [currentIndex, sessionQueue, sessionState]);

    const handleCheckAnswer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userAnswer) return;
        
        const correct = userAnswer.trim().toLowerCase() === sessionQueue[currentIndex].word.toLowerCase();
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            updateWordProgress(sessionQueue[currentIndex].id, ReviewAction.Good);
        } else {
            updateWordProgress(sessionQueue[currentIndex].id, ReviewAction.Again);
        }
    };

    const handleNextWord = () => {
        if (currentIndex < sessionQueue.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setUserAnswer('');
            setShowResult(false);
            setIsCorrect(null);
        } else {
            setSessionState('finished');
        }
    };
    
    if (knownWords.length === 0) {
        return (
            <div className="text-center p-8 bg-white dark:bg-dark-card rounded-lg shadow-md animate-fade-in">
                <h2 className="text-2xl font-bold text-primary mb-4">Start Learning First!</h2>
                <p className="text-gray-600 dark:text-dark-text-secondary">You need to learn at least one word before you can practice listening. Keep up the good work!</p>
            </div>
        );
    }
    
    if (sessionState === 'setup') {
        return (
            <div className="max-w-xl mx-auto text-center p-8 bg-white dark:bg-dark-card rounded-lg shadow-md animate-fade-in">
                 <h2 className="text-2xl font-bold text-primary mb-2">Listening Practice</h2>
                 <p className="text-gray-600 dark:text-dark-text-secondary mb-6">You have {knownWords.length} words available to practice.</p>
                <div className="space-y-4">
                    <button 
                        onClick={() => startSession('all')}
                        className="w-full px-6 py-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-colors duration-300"
                    >
                        Practice All ({knownWords.length} words)
                    </button>
                     <button 
                        onClick={() => startSession('quick_10')}
                        className="w-full px-6 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-hover transition-colors duration-300"
                        disabled={knownWords.length < 10}
                    >
                        Quick Session (10 words)
                    </button>
                </div>
            </div>
        )
    }

    if (sessionState === 'finished' || sessionQueue.length === 0) {
        return (
            <div className="text-center p-8 bg-white dark:bg-dark-card rounded-lg shadow-md animate-fade-in">
                <h2 className="text-2xl font-bold text-primary mb-4">Session Complete!</h2>
                <p className="text-gray-600 dark:text-dark-text-secondary">You have finished your listening practice. Great job!</p>
                 <button 
                    onClick={() => setSessionState('setup')}
                    className="mt-6 px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-colors duration-300"
                >
                    Start Another Session
                </button>
            </div>
        );
    }
    
    const currentWord = sessionQueue[currentIndex];

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
             <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-dark-text">Listening Practice ({currentIndex + 1}/{sessionQueue.length})</h2>
            
            {!showResult ? (
                <div className="p-8 bg-white dark:bg-dark-card rounded-lg shadow-lg text-center">
                    <p className="text-lg text-gray-500 dark:text-dark-text-secondary">Listen and type the word you hear:</p>
                    <button 
                        onClick={() => handleSpeak(currentWord.word)}
                        className="my-6 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover transition-transform transform hover:scale-110"
                        aria-label="Play sound again"
                    >
                        <VolumeIcon />
                    </button>
                    <form onSubmit={handleCheckAnswer} className="mt-4 flex gap-2">
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
                        <span>{isCorrect ? 'Correct!' : `Not quite. The correct word is:`}</span>
                        {!isCorrect && <strong className="ml-1">{currentWord.word}</strong>}
                    </div>

                    <Flashcard key={currentWord.id} word={currentWord} isFlippedInitially={true} />
                    
                    <button 
                        onClick={handleNextWord}
                        className="w-full mt-4 px-6 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-hover transition-colors duration-300"
                    >
                        {currentIndex < sessionQueue.length - 1 ? 'Next Word' : 'Finish Session'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ListeningScreen;
