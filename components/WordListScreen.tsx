
import React, { useState, useMemo } from 'react';
import { useVocabulary } from '../hooks/useVocabulary';
import { LearningStatus, Word } from '../types';
import Flashcard from './Flashcard';

const WordListScreen: React.FC = () => {
    const { words, progress } = useVocabulary();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [unitFilter, setUnitFilter] = useState('All');
    const [selectedWord, setSelectedWord] = useState<Word | null>(null);

    const units = useMemo(() => ['All', ...Array.from(new Set(words.map(w => w.unit).filter(Boolean))).sort((a,b) => a - b)], [words]);

    const filteredWords = useMemo(() => {
        return words.filter(word => {
            const wordProgress = progress[word.id];
            if (statusFilter !== 'All' && wordProgress?.status !== statusFilter) {
                return false;
            }
            if (unitFilter !== 'All' && word.unit !== parseInt(unitFilter)) {
                return false;
            }
            if (searchTerm && !word.word.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            return true;
        });
    }, [words, progress, searchTerm, statusFilter, unitFilter]);

    const getStatusBadge = (status: LearningStatus) => {
        switch (status) {
            case LearningStatus.Mastered: return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Mastered</span>;
            case LearningStatus.Learning: return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">Learning</span>;
            default: return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full">New</span>;
        }
    };
    
    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-dark-text">Word List</h2>
            
            <div className="p-4 bg-white dark:bg-dark-card rounded-lg shadow-md grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input 
                    type="text"
                    placeholder="Search for a word..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-bg text-gray-800 dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-bg text-gray-800 dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-primary">
                    <option value="All">All Statuses</option>
                    <option value={LearningStatus.NotLearned}>Not Learned</option>
                    <option value={LearningStatus.Learning}>Learning</option>
                    <option value={LearningStatus.Mastered}>Mastered</option>
                </select>
                <select value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-bg text-gray-800 dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-primary">
                    {units.map(unit => <option key={unit} value={unit}>{unit === 'All' ? 'All Units' : `Unit ${unit}`}</option>)}
                </select>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden">
                <ul className="divide-y divide-gray-200 dark:divide-dark-border max-h-[60vh] overflow-y-auto">
                    {filteredWords.map(word => (
                        <li key={word.id}>
                            <button onClick={() => setSelectedWord(word)} className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200 text-left">
                                <div>
                                    <p className="font-semibold text-lg text-primary">{word.word}</p>
                                    <p className="text-gray-600 dark:text-dark-text-secondary">{word.meaning}</p>
                                </div>
                                {getStatusBadge(progress[word.id]?.status)}
                            </button>
                        </li>
                    ))}
                </ul>
                {filteredWords.length === 0 && <p className="p-8 text-center text-gray-500">No words match your criteria.</p>}
            </div>

            {selectedWord && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
                    onClick={() => setSelectedWord(null)}
                    aria-modal="true"
                    role="dialog"
                >
                    <div className="w-full max-w-xl" onClick={e => e.stopPropagation()}>
                         <Flashcard key={selectedWord.id} word={selectedWord} isFlippedInitially={false} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default WordListScreen;