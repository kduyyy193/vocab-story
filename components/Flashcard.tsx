import React, { useState } from 'react';
import { Word, PronunciationVoice } from '../types';
import { useVocabulary } from '../hooks/useVocabulary';
import { VolumeIcon, FlipIcon } from './icons';

interface FlashcardProps {
    word: Word;
    isFlippedInitially?: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ word, isFlippedInitially = false }) => {
    const [isFlipped, setIsFlipped] = useState(isFlippedInitially);
    const { settings } = useVocabulary();

    const handleSpeak = (text: string, voiceType?: PronunciationVoice) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Cancel any previous speech
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            let selectedVoice;
            const targetVoice = voiceType || settings.defaultVoice;

            if (targetVoice === PronunciationVoice.UK) {
                 selectedVoice = voices.find(v => v.name.includes('Google UK English') || v.name.includes('British'));
            } else {
                 selectedVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('American'));
            }
            utterance.voice = selectedVoice || voices.find(v => v.lang.startsWith('en')) || voices[0];
            utterance.lang = targetVoice === PronunciationVoice.UK ? 'en-GB' : 'en-US';
            utterance.rate = settings.speechSpeed;
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Your browser does not support text-to-speech.');
        }
    };

    const cardContentStyle = "absolute w-full h-full bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 backface-hidden flex flex-col";

    return (
        <div className="perspective-1000 h-96 w-full">
            <div 
                className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* Front of Card */}
                <div className={`${cardContentStyle} justify-center items-center`}>
                    <h2 className="text-4xl md:text-5xl font-bold text-primary">{word.word}</h2>
                    <p className="text-lg text-gray-500 dark:text-dark-text-secondary mt-2">{word.type}</p>
                     <button onClick={() => handleSpeak(word.word)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                        <VolumeIcon />
                    </button>
                </div>

                {/* Back of Card */}
                 <div className={`${cardContentStyle} rotate-y-180 overflow-y-auto`}>
                    <h3 className="text-2xl font-bold text-primary">{word.word} <span className="text-lg font-normal text-gray-500 dark:text-dark-text-secondary">({word.type})</span></h3>
                    <p className="text-xl mt-2 text-gray-800 dark:text-dark-text">{word.meaning}</p>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 mt-4 text-gray-600 dark:text-dark-text-secondary">
                       <button onClick={() => handleSpeak(word.word, PronunciationVoice.UK)} className="flex items-center space-x-1 p-1 rounded-md transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                           <VolumeIcon className="w-4 h-4" />
                           <span>UK: {word.ipaUK}</span>
                       </button>
                        <button onClick={() => handleSpeak(word.word, PronunciationVoice.US)} className="flex items-center space-x-1 p-1 rounded-md transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                           <VolumeIcon className="w-4 h-4" />
                           <span>US: {word.ipaUS}</span>
                       </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border space-y-3 text-sm">
                        <p className="text-gray-700 dark:text-dark-text-secondary"><strong className="font-semibold text-gray-800 dark:text-dark-text">Ex 1:</strong> {word.example1}</p>
                        <p className="text-gray-500 dark:text-gray-400 italic">"{word.example1Meaning}"</p>
                        {word.example2 && (
                            <>
                                <p className="text-gray-700 dark:text-dark-text-secondary"><strong className="font-semibold text-gray-800 dark:text-dark-text">Ex 2:</strong> {word.example2}</p>
                                <p className="text-gray-500 dark:text-gray-400 italic">"{word.example2Meaning}"</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
             <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="absolute bottom-4 right-4 flex items-center space-x-2 text-xs px-3 py-2 bg-secondary text-white font-semibold rounded-full shadow-md hover:bg-secondary-hover transition-all duration-300 z-10"
                aria-label="Flip card"
            >
                <FlipIcon />
                <span>Flip</span>
            </button>
        </div>
    );
};

// Add custom utilities for 3D transform if not in standard Tailwind
const style = document.createElement('style');
style.innerHTML = `
  .perspective-1000 { perspective: 1000px; }
  .transform-style-3d { transform-style: preserve-3d; }
  .rotate-y-180 { transform: rotateY(180deg); }
  .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
`;
document.head.appendChild(style);


export default Flashcard;