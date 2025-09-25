import React, { useRef } from 'react';
import { ipaData } from '../data/ipaData';
import { IpaSymbol } from '../types';
import { useVocabulary } from '../hooks/useVocabulary';

interface IpaInputProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const IpaInput: React.FC<IpaInputProps> = ({ id, value, onChange, placeholder }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { settings } = useVocabulary();

    const speakExampleWord = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            const selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
            utterance.voice = selectedVoice;
            utterance.lang = 'en-US';
            utterance.rate = settings.speechSpeed;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSymbolClick = (symbolData: IpaSymbol) => {
        speakExampleWord(symbolData.exampleWord);
        const input = inputRef.current;
        if (!input) return;

        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const newValue = value.substring(0, start) + symbolData.symbol + value.substring(end);
        
        onChange(newValue);
        
        // Focus and set cursor position after the inserted symbol
        setTimeout(() => {
            input.focus();
            input.setSelectionRange(start + symbolData.symbol.length, start + symbolData.symbol.length);
        }, 0);
    };

    return (
        <div>
            <input
                ref={inputRef}
                id={id}
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-3 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-bg text-gray-800 dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
            />
            <div className="mt-2 grid grid-cols-8 sm:grid-cols-12 gap-1">
                {ipaData.map(symbol => (
                    <button
                        type="button"
                        key={symbol.symbol}
                        onClick={() => handleSymbolClick(symbol)}
                        className="p-1 rounded text-center font-mono text-sm bg-gray-200 dark:bg-slate-700 hover:bg-primary hover:text-white transition-colors"
                        title={`${symbol.exampleWord} (${symbol.type})`}
                    >
                        {symbol.symbol}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default IpaInput;