
import React, { useState, useEffect, useMemo } from 'react';
import { useVocabulary } from '../hooks/useVocabulary';
import { Word, LearningStatus } from '../types';
import { ReviewAction } from '../constants';
import { CheckIcon, XIcon } from './icons';

interface QuizQuestion {
    word: Word;
    options: string[];
    correctAnswer: string;
}

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

const ExercisesScreen: React.FC = () => {
    const { getWordsToLearn, progress, updateWordsProgress } = useVocabulary();
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [isSessionFinished, setIsSessionFinished] = useState(false);
    const [autoNext, setAutoNext] = useState(false);
    const [correctWordIds, setCorrectWordIds] = useState<string[]>([]);

    const knownWords = useMemo(() => {
        return getWordsToLearn().filter(word => progress[word.id]?.status !== LearningStatus.NotLearned);
    }, [getWordsToLearn, progress]);

    useEffect(() => {
        generateNewSession();
    }, [knownWords]);

    const generateNewSession = () => {
        if (knownWords.length < 4) return;
        console.log(knownWords);

        const sessionWords = shuffleArray(knownWords).slice(0, 10);
        const newQuestions = sessionWords.map((questionWord: any) => {
            const correctAnswer = questionWord.meaning;
            const wrongAnswers = shuffleArray(getWordsToLearn().filter(w => w.id !== questionWord.id))
                .slice(0, 3)
                .map((w: any) => w.meaning);

            return {
                word: questionWord,
                options: shuffleArray([correctAnswer, ...wrongAnswers]),
                correctAnswer,
            };
        });

        setQuestions(newQuestions);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setScore(0);
        setIsSessionFinished(false);
    };

    const handleAnswer = (answer: string) => {
        if (selectedAnswer) return;

        setSelectedAnswer(answer);
        const correct = answer === questions[currentIndex].correctAnswer;
        setIsCorrect(correct);

        if (correct) {
            setScore(prev => prev + 1);
            setCorrectWordIds(prev => [...prev, questions[currentIndex].word.id]);
        }

        if (autoNext) {
            setTimeout(() => {
                handleNext();
            }, 700);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
        } else {
            console.log("sss");
            setIsSessionFinished(true);
        }
    };

    if (knownWords.length < 4) {
        return (
            <div className="text-center p-8 bg-white dark:bg-dark-card rounded-lg shadow-md animate-fade-in">
                <h2 className="text-2xl font-bold text-primary mb-4">Practice Makes Perfect!</h2>
                <p className="text-gray-600 dark:text-dark-text-secondary">You need to learn at least 4 words before you can start practicing. Keep learning!</p>
            </div>
        );
    }


    if (isSessionFinished) {
        return (
            <div className="text-center p-8 bg-white dark:bg-dark-card rounded-lg shadow-md animate-fade-in">
                <h2 className="text-2xl font-bold text-primary mb-4">Session Complete!</h2>
                <p className="text-4xl font-bold my-4">Your score: {score} / {questions.length}</p>

                <div className="mt-6 space-y-4 flex-col flex">
                    <button
                        onClick={generateNewSession}
                        className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-colors duration-300"
                    >
                        Start New Session
                    </button>

                    {correctWordIds.length > 0 && (
                        <>
                            <button
                                onClick={() => updateWordsProgress(correctWordIds, ReviewAction.Good)}
                                className="px-6 py-3 bg-success text-white font-semibold rounded-lg shadow-md hover:bg-success/90 transition-colors duration-300"
                            >
                                <p>Save Answer</p>
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    if (questions.length === 0) return null;

    const currentQuestion = questions[currentIndex];

    return (
        <div className="space-y-8 animate-fade-in max-w-2xl mx-auto"><div className="flex items-center justify-end mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={autoNext}
                    onChange={() => setAutoNext(prev => !prev)}
                    className="toggle-checkbox"
                />
                <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Auto Next</span>
            </label>
        </div>
            <div className="relative pt-4">
                <div className="flex justify-between items-center mb-2 text-sm text-gray-600 dark:text-dark-text-secondary">
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                    <span>Score: {score}</span>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/20">
                    <div style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"></div>
                </div>
            </div>

            <div className="p-8 bg-white dark:bg-dark-card rounded-lg shadow-lg text-center">
                <p className="text-gray-500 dark:text-dark-text-secondary">What is the meaning of:</p>
                <h2 className="text-4xl font-bold text-primary my-4">{currentQuestion.word.word}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map(option => {
                    let buttonClass = "w-full p-4 rounded-lg shadow-md transition-all duration-200 text-left bg-white dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-slate-700";
                    if (selectedAnswer) {
                        if (option === currentQuestion.correctAnswer) {
                            buttonClass = "w-full p-4 rounded-lg shadow-md text-left bg-success/80 text-white";
                        } else if (option === selectedAnswer) {
                            buttonClass = "w-full p-4 rounded-lg shadow-md text-left bg-danger/80 text-white";
                        } else {
                            buttonClass += " opacity-50";
                        }
                    }
                    return (
                        <button key={option} onClick={() => handleAnswer(option)} disabled={!!selectedAnswer} className={buttonClass}>
                            {option}
                        </button>
                    )
                })}
            </div>

            {selectedAnswer && (
                <div className="text-center mt-6 animate-fade-in">
                    <div className={`flex items-center justify-center gap-2 text-lg font-semibold ${isCorrect ? 'text-success' : 'text-danger'}`}>
                        {isCorrect ? <CheckIcon /> : <XIcon />}
                        <span>{isCorrect ? 'Correct!' : 'Incorrect!'}</span>
                    </div>
                    <button onClick={handleNext} className="mt-4 px-8 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-hover transition-colors duration-300">
                        {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Session'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExercisesScreen;