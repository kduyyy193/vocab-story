
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useVocabulary } from '../hooks/useVocabulary';
import { NewWord, Screen } from '../types';
import IpaInput from './IpaInput';
import { XIcon } from './icons';

interface AddWordScreenProps {
    setScreen: (screen: Screen) => void;
}

const AddWordScreen: React.FC<AddWordScreenProps> = ({ setScreen }) => {
    const { addWord } = useVocabulary();
    
    const [wordInput, setWordInput] = useState('');
    const [generatedWords, setGeneratedWords] = useState<NewWord[]>([]);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    
    const handleGenerateDetails = async () => {
        const wordsToProcess = wordInput.split(',').map(w => w.trim()).filter(Boolean);
        if (wordsToProcess.length === 0) {
            setError('Please enter at least one word.');
            return;
        }
        
        setIsGenerating(true);
        setError('');
        setGeneratedWords([]);
        setGenerationProgress('');

        const failedWords: string[] = [];

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const singleWordSchema = {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING },
                    meaning: { type: Type.STRING },
                    type: { type: Type.STRING },
                    ipaUK: { type: Type.STRING },
                    ipaUS: { type: Type.STRING },
                    example1: { type: Type.STRING },
                    example1Meaning: { type: Type.STRING },
                },
            };

            for (const [index, word] of wordsToProcess.entries()) {
                setGenerationProgress(`(${index + 1}/${wordsToProcess.length})`);
                try {
                    const response = await ai.models.generateContent({
                        model: "gemini-2.5-flash",
                        contents: `For the English word "${word}", provide a detailed vocabulary entry. The entry must include its most common meaning in Vietnamese, its primary word type (e.g., noun, verb), UK and US IPA transcriptions, one simple example sentence, and the Vietnamese translation of that sentence. Provide the output as a single JSON object that adheres to the provided schema.`,
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: singleWordSchema,
                        },
                    });

                    const result = JSON.parse(response.text) as NewWord;
                    setGeneratedWords(prev => [...prev, result]);

                } catch (err) {
                    console.error(`Failed to process word "${word}":`, err);
                    failedWords.push(word);
                }
            }

        } catch (err) {
            console.error("Gemini API initialization error:", err);
            setError("Failed to initialize the AI model. Please check your API key and network connection.");
        } finally {
            setIsGenerating(false);
            setGenerationProgress('');
            if (failedWords.length > 0) {
                setError(`Could not generate details for: ${failedWords.join(', ')}. Please check spelling or try again.`);
            }
        }
    };

    const handleFieldChange = (index: number, field: keyof NewWord, value: string) => {
        const updatedWords = [...generatedWords];
        updatedWords[index] = { ...updatedWords[index], [field]: value };
        setGeneratedWords(updatedWords);
    };
    
    const handleRemoveWord = (index: number) => {
        setGeneratedWords(generatedWords.filter((_, i) => i !== index));
    };

    const handleSaveAll = async (e: React.FormEvent) => {
        e.preventDefault();
        if (generatedWords.length === 0) {
            setError('There are no words to save.');
            return;
        }

        setError('');
        setIsSaving(true);
        
        let successCount = 0;
        const errors: string[] = [];

        for (const word of generatedWords) {
             if (!word.word || !word.meaning || !word.type || !word.example1 || !word.example1Meaning) {
                errors.push(`Skipping incomplete entry for "${word.word || 'unknown'}"`);
                continue;
            }
            try {
                await addWord(word);
                successCount++;
            } catch (err: any) {
                errors.push(`Failed to add "${word.word}": ${err.message}`);
            }
        }
        
        setIsSaving(false);
        alert(`${successCount} word(s) added successfully!`);

        if (errors.length > 0) {
            setError(`Some words could not be saved:\n${errors.join('\n')}`);
        } else {
            setScreen(Screen.WordList);
        }
    };

    const inputClass = "w-full p-3 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-bg text-gray-800 dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-primary transition-shadow";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1";

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-dark-card rounded-lg shadow-lg animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-dark-text">Add New Words</h2>
            
            <div className="space-y-4">
                 <div className="flex flex-col sm:flex-row gap-2">
                    <textarea 
                        id="word" 
                        value={wordInput} 
                        onChange={e => setWordInput(e.target.value)} 
                        className={inputClass}
                        placeholder="Enter words separated by commas, e.g., gecko, flamingo, peacock"
                        rows={3}
                        disabled={isGenerating}
                    />
                    <button
                        onClick={handleGenerateDetails}
                        disabled={isGenerating}
                        className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isGenerating ? `Generating... ${generationProgress}` : 'Generate Details'}
                    </button>
                </div>
            </div>
            
            {error && <p className="text-danger whitespace-pre-line text-sm text-center p-2 bg-danger/10 rounded-md mt-4">{error}</p>}

            {generatedWords.length > 0 && (
                <form onSubmit={handleSaveAll} className="space-y-6 mt-6 pt-6 border-t border-gray-200 dark:border-dark-border">
                     {generatedWords.map((wordData, index) => (
                        <div key={index} className="relative p-4 border border-gray-200 dark:border-dark-border rounded-lg space-y-4 bg-gray-50 dark:bg-dark-bg animate-fade-in">
                            <button 
                                type="button" 
                                onClick={() => handleRemoveWord(index)}
                                className="absolute top-2 right-2 p-1 text-gray-500 hover:text-danger hover:bg-danger/10 rounded-full"
                                aria-label="Remove word"
                            >
                                <XIcon />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor={`word-${index}`} className={labelClass}>Word*</label>
                                    <input id={`word-${index}`} type="text" value={wordData.word} onChange={e => handleFieldChange(index, 'word', e.target.value)} className={inputClass} required />
                                </div>
                                <div>
                                    <label htmlFor={`meaning-${index}`} className={labelClass}>Meaning (Vietnamese)*</label>
                                    <input id={`meaning-${index}`} type="text" value={wordData.meaning} onChange={e => handleFieldChange(index, 'meaning', e.target.value)} className={inputClass} required />
                                </div>
                                <div>
                                    <label htmlFor={`type-${index}`} className={labelClass}>Word Type*</label>
                                    <select id={`type-${index}`} value={wordData.type} onChange={e => handleFieldChange(index, 'type', e.target.value)} className={inputClass} required>
                                        <option value="noun">Noun</option>
                                        <option value="verb">Verb</option>
                                        <option value="adjective">Adjective</option>
                                        <option value="adverb">Adverb</option>
                                        <option value="preposition">Preposition</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label htmlFor={`ipaUK-${index}`} className={labelClass}>IPA (UK)</label>
                                <IpaInput id={`ipaUK-${index}`} value={wordData.ipaUK} onChange={value => handleFieldChange(index, 'ipaUK', value)} placeholder="/ˈsʌm.θɪŋ/" />
                            </div>
                            <div>
                                <label htmlFor={`ipaUS-${index}`} className={labelClass}>IPA (US)</label>
                                <IpaInput id={`ipaUS-${index}`} value={wordData.ipaUS} onChange={value => handleFieldChange(index, 'ipaUS', value)} placeholder="/ˈsʌm.θɪŋ/" />
                            </div>
                            <div>
                                <label htmlFor={`example1-${index}`} className={labelClass}>Example Sentence*</label>
                                <textarea id={`example1-${index}`} value={wordData.example1} onChange={e => handleFieldChange(index, 'example1', e.target.value)} className={inputClass} rows={2} required></textarea>
                            </div>
                            <div>
                                <label htmlFor={`example1Meaning-${index}`} className={labelClass}>Example Meaning*</label>
                                <textarea id={`example1Meaning-${index}`} value={wordData.example1Meaning} onChange={e => handleFieldChange(index, 'example1Meaning', e.target.value)} className={inputClass} rows={2} required></textarea>
                            </div>
                        </div>
                    ))}

                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="w-full mt-4 px-6 py-3 bg-success text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-success/50 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                        {isSaving ? 'Saving...' : `Save All ${generatedWords.length} Words`}
                    </button>
                </form>
            )}
        </div>
    );
};

export default AddWordScreen;
