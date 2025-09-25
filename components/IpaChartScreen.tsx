import React, { useState } from 'react';
import { ipaData } from '../data/ipaData';
import { IpaSymbol } from '../types';
import { useVocabulary } from '../hooks/useVocabulary';

const IpaChartScreen: React.FC = () => {
    const [selectedSymbol, setSelectedSymbol] = useState<IpaSymbol | null>(ipaData[0]);
    const { settings } = useVocabulary();

    const speakExampleWord = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance('iː');
            const voices = window.speechSynthesis.getVoices();
            const selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
            utterance.voice = selectedVoice;
            utterance.lang = 'en-US';
            utterance.rate = settings.speechSpeed;
            window.speechSynthesis.speak(utterance);
        }
    };
    
    const handleSymbolClick = (symbol: IpaSymbol) => {
        setSelectedSymbol(symbol);
        speakExampleWord(symbol.exampleWord);
    }
    
    const renderChart = (type: IpaSymbol['type'], title: string) => (
         <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-dark-text-secondary">{title}</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {ipaData.filter(s => s.type === type).map(symbol => (
                    <button 
                        key={symbol.symbol}
                        onClick={() => handleSymbolClick(symbol)}
                        className={`p-3 rounded-lg text-center font-mono text-lg transition-all duration-200 ${
                            selectedSymbol?.symbol === symbol.symbol 
                            ? 'bg-primary text-white scale-110 shadow-lg' 
                            : 'bg-white dark:bg-dark-card hover:bg-gray-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        {symbol.symbol}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
            <div className="lg:w-2/3">
                {renderChart('vowel', 'Vowels')}
                {renderChart('diphthong', 'Diphthongs')}
                {renderChart('consonant', 'Consonants')}
            </div>
            <div className="lg:w-1/3">
                 {selectedSymbol && (
                    <div className="sticky top-24 p-6 bg-white dark:bg-dark-card rounded-lg shadow-lg">
                        <h2 className="text-5xl font-mono text-primary">{selectedSymbol.symbol}</h2>
                        <p className="mt-2 text-lg text-gray-700 dark:text-dark-text">Example: <strong className="font-semibold">{selectedSymbol.exampleWord}</strong></p>
                        <p className="mt-4 text-gray-600 dark:text-dark-text-secondary">{selectedSymbol.description}</p>
                        <button 
                            onClick={() => speakExampleWord(selectedSymbol.exampleWord)}
                            className="mt-6 w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover transition-colors duration-300"
                        >
                            Listen Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IpaChartScreen;