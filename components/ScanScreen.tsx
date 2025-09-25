
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useVocabulary } from '../hooks/useVocabulary';
import { NewWord } from '../types';

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

type EvaluationQuality = 'good' | 'medium' | 'bad';
interface EvaluationResult {
    quality: EvaluationQuality;
    feedback: string;
}

const ScanScreen: React.FC = () => {
    const { addWord } = useVocabulary();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [extractedWords, setExtractedWords] = useState<NewWord[]>([]);
    const [addedWords, setAddedWords] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const evaluateImageQuality = async (file: File) => {
        setIsEvaluating(true);
        setEvaluationResult(null);
        setError(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const imagePart = await fileToGenerativePart(file);
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: {
                    parts: [
                        imagePart,
                        { text: "Analyze the attached image and evaluate its quality for optical character recognition (OCR) to extract English words. Consider factors like clarity, lighting, text orientation, and any obstructions. Respond with a JSON object containing two keys: 'quality' (a string with one of three values: 'good', 'medium', or 'bad') and 'feedback' (a short, user-friendly sentence in English explaining the quality, e.g., 'This image is clear and well-lit.' or 'The text is blurry and hard to read.')." }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            quality: { type: Type.STRING },
                            feedback: { type: Type.STRING }
                        }
                    }
                }
            });

            const result = JSON.parse(response.text) as EvaluationResult;
            setEvaluationResult(result);

        } catch (err) {
            console.error("Image evaluation error:", err);
            setEvaluationResult({
                quality: 'medium',
                feedback: 'Could not automatically evaluate image quality. Results may vary.'
            });
        } finally {
            setIsEvaluating(false);
        }
    };
    
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setExtractedWords([]);
            setError(null);
            evaluateImageQuality(file);
        }
    };

    const handleScanImage = async () => {
        if (!imageFile) {
            setError("Please select an image first.");
            return;
        }

        setIsScanning(true);
        setError(null);
        setExtractedWords([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const imagePart = await fileToGenerativePart(imageFile);
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: {
                    parts: [
                        imagePart,
                        { text: "From the attached image, identify and extract all English vocabulary words. For each word, provide its most common meaning in Vietnamese, its word type (noun, verb, etc.), its UK and US IPA phonetic transcriptions, one example sentence in English, and the meaning of that sentence in Vietnamese. Present the output as a JSON object that adheres to the provided schema. If no words are found, return an empty array." }
                    ]
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            word: { type: Type.STRING, description: "The extracted English word." },
                            type: { type: Type.STRING, description: "The word type (e.g., noun, verb)." },
                            meaning: { type: Type.STRING, description: "The Vietnamese meaning of the word." },
                            ipaUK: { type: Type.STRING, description: "The UK IPA transcription." },
                            ipaUS: { type: Type.STRING, description: "The US IPA transcription." },
                            example1: { type: Type.STRING, description: "An example sentence using the word." },
                            example1Meaning: { type: Type.STRING, description: "The Vietnamese translation of the example sentence." },
                          },
                        },
                    },
                }
            });

            const parsedText = JSON.parse(response.text);
            if (Array.isArray(parsedText)) {
                setExtractedWords(parsedText as NewWord[]);
                 if (parsedText.length === 0) {
                    setError("No vocabulary words could be found in the image.");
                }
            } else {
                throw new Error("Invalid response format from API.");
            }
        } catch (err) {
            console.error("Gemini API Error:", err);
            setError("Failed to analyze image. The API key might be invalid or the model may be unavailable. Please try again later.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleAddWord = async (wordToAdd: NewWord) => {
        try {
            await addWord(wordToAdd);
            setAddedWords(prev => [...prev, wordToAdd.word]);
        } catch (err) {
            alert("Failed to add word.");
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-dark-text">Scan Vocabulary from Image</h2>
            
            <div className="p-6 bg-white dark:bg-dark-card rounded-lg shadow-lg">
                <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden" />
                {!imagePreview && (
                    <div 
                        className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <p className="text-gray-500 dark:text-dark-text-secondary">Click here to upload an image or take a photo.</p>
                        <p className="text-sm text-gray-400">PNG, JPG, WEBP</p>
                    </div>
                )}
                {imagePreview && (
                    <div className="space-y-4">
                        <img src={imagePreview} alt="Selected preview" className="max-h-80 w-auto mx-auto rounded-lg shadow-md" />
                        
                        <div className="max-w-md mx-auto">
                            {isEvaluating && <p className="text-center text-gray-500 dark:text-dark-text-secondary">Evaluating image quality...</p>}
                            {evaluationResult && (
                                <div className={`p-3 rounded-md text-center text-sm font-medium ${
                                    evaluationResult.quality === 'good' ? 'bg-success/20 text-success' :
                                    evaluationResult.quality === 'medium' ? 'bg-warning/20 text-warning' :
                                    'bg-danger/20 text-danger'
                                }`}>
                                    {evaluationResult.feedback}
                                </div>
                            )}
                        </div>

                         <div className="flex justify-center gap-4">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-hover transition-colors"
                            >
                                Change Image
                            </button>
                            <button
                                onClick={handleScanImage}
                                disabled={isScanning || isEvaluating}
                                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isScanning ? 'Scanning...' : 'Scan Image'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isScanning && <p className="text-center text-gray-600 dark:text-dark-text-secondary">Analyzing image, this may take a moment...</p>}
            {error && <p className="text-center text-danger p-3 bg-danger/10 rounded-md">{error}</p>}
            
            {extractedWords.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-dark-text">Found Words:</h3>
                    <ul className="space-y-3">
                        {extractedWords.map((word, index) => {
                            const isAdded = addedWords.includes(word.word);
                            return (
                                <li key={index} className="p-4 bg-white dark:bg-dark-card rounded-lg shadow-md flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-lg text-primary">{word.word} <span className="text-sm font-normal text-gray-500 dark:text-dark-text-secondary">({word.type})</span></h4>
                                        <p className="text-gray-700 dark:text-dark-text">{word.meaning}</p>
                                        <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1 italic">"{word.example1}"</p>
                                    </div>
                                    <button
                                        onClick={() => handleAddWord(word)}
                                        disabled={isAdded}
                                        className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-slate-600 disabled:text-gray-500 bg-success text-white hover:bg-green-700"
                                    >
                                        {isAdded ? 'Added' : 'Add'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ScanScreen;
