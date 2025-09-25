
import React from 'react';
import { useVocabulary } from '../hooks/useVocabulary';
import { Screen, LearningStatus } from '../types';
import { LearnIcon, ReviewIcon, StatsIcon, IpaIcon, ExerciseIcon, ListIcon, ListeningIcon } from './icons';

interface HomeScreenProps {
    setScreen: (screen: Screen) => void;
}

const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
    <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-md flex flex-col items-center justify-center border-l-4" style={{ borderColor: color }}>
        <p className="text-3xl font-bold text-gray-800 dark:text-dark-text">{value}</p>
        <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{title}</p>
    </div>
);

const ActionButton: React.FC<{ title: string; subtitle: string; onClick: () => void; children: React.ReactNode, disabled?: boolean }> = ({ title, subtitle, onClick, children, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`bg-white dark:bg-dark-card p-6 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center space-x-4 w-full text-left ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <div className="text-primary">{children}</div>
        <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{subtitle}</p>
        </div>
    </button>
);

const HomeScreen: React.FC<HomeScreenProps> = ({ setScreen }) => {
    const { stats, getWordsToReview, progress } = useVocabulary();
    const wordsToReviewCount = getWordsToReview().length;
    const wordsForExerciseCount = stats.learning + stats.mastered;

    return (
        <div className="space-y-8 animate-fade-in">
            <section className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-dark-text">Welcome Back!</h2>
                <p className="text-gray-600 dark:text-dark-text-secondary">Here's your progress summary.</p>
            </section>

            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Words to Review" value={wordsToReviewCount} color="#f97316" />
                <StatCard title="New Words" value={stats.notLearned} color="#0891b2" />
                <StatCard title="Learning" value={stats.learning} color="#eab308" />
                <StatCard title="Mastered" value={stats.mastered} color="#16a34a" />
            </section>
            
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActionButton
                    title="Learn New Words"
                    subtitle={`${stats.notLearned} words remaining`}
                    onClick={() => setScreen(Screen.Learn)}
                    disabled={stats.notLearned === 0}
                >
                    <LearnIcon />
                </ActionButton>
                <ActionButton
                    title="Review Words"
                    subtitle={`${wordsToReviewCount} words ready for review`}
                    onClick={() => setScreen(Screen.Review)}
                    disabled={wordsToReviewCount === 0}
                >
                    <ReviewIcon />
                </ActionButton>
                <ActionButton
                    title="Practice with Exercises"
                    subtitle={`${wordsForExerciseCount} words available to practice`}
                    onClick={() => setScreen(Screen.Exercises)}
                    disabled={wordsForExerciseCount < 4}
                >
                    <ExerciseIcon />
                </ActionButton>
                 <ActionButton
                    title="Listening Practice"
                    subtitle={`Practice with ${wordsForExerciseCount} known words`}
                    onClick={() => setScreen(Screen.Listening)}
                    disabled={wordsForExerciseCount === 0}
                >
                    <ListeningIcon />
                </ActionButton>
                <ActionButton
                    title="Browse Word List"
                    subtitle={`Explore all ${stats.total} words`}
                    onClick={() => setScreen(Screen.WordList)}
                >
                    <ListIcon />
                </ActionButton>
                 <ActionButton
                    title="View Statistics"
                    subtitle="Track your learning journey"
                    onClick={() => setScreen(Screen.Stats)}
                >
                    <StatsIcon />
                </ActionButton>
                 <ActionButton
                    title="IPA Chart"
                    subtitle="Master English pronunciation"
                    onClick={() => setScreen(Screen.IpaChart)}
                >
                    <IpaIcon />
                </ActionButton>
            </section>
        </div>
    );
};

export default HomeScreen;