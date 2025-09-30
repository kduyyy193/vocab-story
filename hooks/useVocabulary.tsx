
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, initializationError } from '../firebase';
import { Word, NewWord, WordProgress, LearningStatus, AppSettings, PronunciationVoice } from '../types';
import { LOCAL_STORAGE_SETTINGS_KEY, LOCAL_STORAGE_PROGRESS_KEY, SRS_STAGES, ReviewAction } from '../constants';
import { sampleVocabulary } from '../data/sampleVocabulary';

const { collection, onSnapshot, addDoc, doc, setDoc } = (window as any).firebase.firestore;

// The user type from useAuth
interface User {
    uid: string;
}

interface VocabularyProviderProps {
    children: ReactNode;
    user: User | null;
    isGuest: boolean;
}

interface VocabularyContextType {
    words: Word[];
    progress: Record<string, WordProgress>;
    settings: AppSettings;
    loading: boolean;
    initializationError: string | null;
    getWordsToLearn: () => Word[];
    getWordsToReview: () => Word[];
    addWord: (newWord: NewWord) => Promise<void>;
    updateWordProgress: (wordId: string, action: ReviewAction) => void;
    updateWordsProgress: (wordId: string[], action: ReviewAction) => void;
    markAsMastered: (wordId: string) => void;
    stats: {
        total: number;
        notLearned: number;
        learning: number;
        mastered: number;
    };
    updateSettings: (newSettings: Partial<AppSettings>) => void;
    resetProgress: () => void;
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

const getInitialSettings = (): AppSettings => {
    const defaultSettings: AppSettings = { theme: 'dark', defaultVoice: PronunciationVoice.UK, speechSpeed: 1 };
    try {
        const savedSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
        if (savedSettings) {
            return { ...defaultSettings, ...JSON.parse(savedSettings) };
        }
    } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
    }
    return defaultSettings;
};


export const VocabularyProvider: React.FC<VocabularyProviderProps> = ({ children, user, isGuest }) => {
    const [words, setWords] = useState<Word[]>([]);
    const [progress, setProgress] = useState<Record<string, WordProgress>>({});
    const [settings, setSettings] = useState<AppSettings>(getInitialSettings);
    const [loading, setLoading] = useState<boolean>(true);

    // Effect for handling data based on auth state (user vs guest)
    useEffect(() => {
        setLoading(true);

        // --- GUEST MODE ---
        if (isGuest) {
            setWords(sampleVocabulary);
            const guestProgressKey = `${LOCAL_STORAGE_PROGRESS_KEY}_guest`;
            try {
                const savedProgress = localStorage.getItem(guestProgressKey);
                let initialProgress = savedProgress ? JSON.parse(savedProgress) : {};

                // Ensure progress exists for all sample words
                sampleVocabulary.forEach(word => {
                    if (!initialProgress[word.id]) {
                        initialProgress[word.id] = { status: LearningStatus.NotLearned, stage: 0, nextReviewDate: null };
                    }
                });

                setProgress(initialProgress);

            } catch (error) {
                console.error("Failed to load guest progress", error);
            }
            setLoading(false);
            return; // Stop here for guests
        }

        // --- AUTHENTICATED USER MODE ---
        if (!user || initializationError) {
            setLoading(false);
            return;
        }

        // Fetch user-specific words from Firestore
        const wordsCollectionRef = collection(db, "users", user.uid, "words");
        const unsubscribeWords = onSnapshot(wordsCollectionRef, (snapshot) => {
            const wordsData: Word[] = [];
            snapshot.forEach(doc => {
                wordsData.push({ id: doc.id, ...doc.data() } as Word);
            });
            setWords(wordsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching user words from Firestore:", error);
            setLoading(false);
        });

        // Fetch user-specific progress from Firestore
        const progressDocRef = doc(db, "users", user.uid, "progress", "main");
        const unsubscribeProgress = onSnapshot(progressDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setProgress(docSnap.data() as Record<string, WordProgress>);
            } else {
                setProgress({}); // Start with empty progress if none exists
            }
        });

        return () => {
            unsubscribeWords();
            unsubscribeProgress();
        };

    }, [user, isGuest]);

    // Sync progress when words change (for authenticated users)
    useEffect(() => {
        if (!user || isGuest) return;

        const progressDocRef = doc(db, "users", user.uid, "progress", "main");
        const newProgress = { ...progress };
        let hasChanged = false;

        words.forEach(word => {
            if (!newProgress[word.id]) {
                newProgress[word.id] = { status: LearningStatus.NotLearned, nextReviewDate: null, stage: 0 };
                hasChanged = true;
            }
        });

        // This could be expensive if run on every progress change, but necessary to clean up deleted words
        Object.keys(newProgress).forEach(wordId => {
            if (!words.some(w => w.id === wordId)) {
                delete newProgress[wordId];
                hasChanged = true;
            }
        });

        if (hasChanged) {
            setDoc(progressDocRef, newProgress, { merge: true });
        }
    }, [words, user, isGuest]); // dependency on `progress` was removed to prevent loops

    // Save settings and guest progress to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
            if (isGuest) {
                const guestProgressKey = `${LOCAL_STORAGE_PROGRESS_KEY}_guest`;
                localStorage.setItem(guestProgressKey, JSON.stringify(progress));
            }
        } catch (error) {
            console.error("Failed to save to localStorage", error);
        }
    }, [settings, progress, isGuest]);

    const updateProgressInFirestore = async (newProgress: Record<string, WordProgress>) => {
        if (!user || initializationError) return;
        const progressDocRef = doc(db, "users", user.uid, "progress", "main");
        try {
            await setDoc(progressDocRef, newProgress, { merge: true });
        } catch (error) {
            console.error("Failed to update progress in Firestore:", error);
        }
    };

    const addWord = async (newWord: NewWord) => {
        if (isGuest) {
            throw new Error("Guests cannot add new words. Please sign up to save your vocabulary.");
        }
        if (!user || initializationError) {
            throw new Error("User not authenticated or Firebase not initialized.");
        }
        try {
            const wordsCollectionRef = collection(db, "users", user.uid, "words");
            await addDoc(wordsCollectionRef, newWord);
        } catch (error) {
            console.error("Error adding word to Firestore:", error);
            throw error;
        }
    };

    const getWordsToLearn = () => words.filter(word => !progress[word.id] || progress[word.id]?.status === LearningStatus.NotLearned || progress[word.id]?.status === LearningStatus.Learning);

    const getWordsToReview = () => {
        const today = new Date().toISOString().split('T')[0];
        return words.filter(word => {
            const wordProgress = progress[word.id];
            return wordProgress?.status === LearningStatus.Learning && wordProgress.nextReviewDate && wordProgress.nextReviewDate <= today;
        });
    };

    const addDays = (date: Date, days: number): Date => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    const updateWordProgress = (wordId: string, action: ReviewAction) => {
        const updatedProgress = { ...progress };
        const current = updatedProgress[wordId] || { status: LearningStatus.NotLearned, stage: 0, nextReviewDate: null };
        let newStage = current.stage;
        let newStatus = LearningStatus.Learning;

        switch (action) {
            case ReviewAction.Again: newStage = 0; break;
            case ReviewAction.Hard: newStage = Math.max(0, current.stage - 1); break;
            case ReviewAction.Good: newStage = current.status === LearningStatus.NotLearned ? 0 : current.stage + 1; break;
            case ReviewAction.Easy: newStage = current.status === LearningStatus.NotLearned ? 1 : current.stage + 2; break;
        }

        if (newStage >= SRS_STAGES.length) {
            newStatus = LearningStatus.Mastered;
            updatedProgress[wordId] = { ...current, status: newStatus, nextReviewDate: null, stage: newStage };
        } else {
            const reviewInterval = SRS_STAGES[newStage];
            const nextReviewDate = addDays(new Date(), reviewInterval).toISOString().split('T')[0];
            updatedProgress[wordId] = { status: newStatus, nextReviewDate, stage: newStage };
        }

        setProgress(updatedProgress);
        if (user) {
            updateProgressInFirestore(updatedProgress);
        }
    };

    const updateWordsProgress = (wordIds: string[], action: ReviewAction) => {
        const updatedProgress = { ...progress };
        let hasChanged = false;

        wordIds.forEach(wordId => {
            const current = updatedProgress[wordId] || { status: LearningStatus.NotLearned, stage: 0, nextReviewDate: null };
            let newStage = current.stage;
            let newStatus = LearningStatus.Learning;

            switch (action) {
                case ReviewAction.Again: newStage = 0; break;
                case ReviewAction.Hard: newStage = Math.max(0, current.stage - 1); break;
                case ReviewAction.Good: newStage = current.status === LearningStatus.NotLearned ? 0 : current.stage + 1; break;
                case ReviewAction.Easy: newStage = current.status === LearningStatus.NotLearned ? 1 : current.stage + 2; break;
            }

            if (newStage >= SRS_STAGES.length) {
                newStatus = LearningStatus.Mastered;
                updatedProgress[wordId] = { ...current, status: newStatus, nextReviewDate: null, stage: newStage };
            } else {
                const reviewInterval = SRS_STAGES[newStage];
                const nextReviewDate = addDays(new Date(), reviewInterval).toISOString().split('T')[0];
                updatedProgress[wordId] = { status: newStatus, nextReviewDate, stage: newStage };
            }

            hasChanged = true;
        });

        if (hasChanged) {
            setProgress(updatedProgress);
            if (user) {
                updateProgressInFirestore(updatedProgress);
            }
        }
    };

    const markAsMastered = (wordId: string) => {
        const updatedProgress = { ...progress };
        updatedProgress[wordId] = { ...progress[wordId], status: LearningStatus.Mastered, nextReviewDate: null, stage: SRS_STAGES.length };
        setProgress(updatedProgress);
        if (user) {
            updateProgressInFirestore(updatedProgress);
        }
    };

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const resetProgress = async () => {
        const initialProgress: Record<string, WordProgress> = {};
        words.forEach(word => {
            initialProgress[word.id] = {
                status: LearningStatus.NotLearned,
                nextReviewDate: null,
                stage: 0,
            };
        });
        setProgress(initialProgress);
        if (user) {
            await updateProgressInFirestore(initialProgress);
        }
        alert("Your learning progress has been reset.");
    };

    const stats = {
        total: words.length,
        notLearned: words.filter(w => !progress[w.id] || progress[w.id].status === LearningStatus.NotLearned).length,
        learning: Object.values(progress as WordProgress[]).filter(p => p.status === LearningStatus.Learning).length,
        mastered: Object.values(progress as WordProgress[]).filter(p => p.status === LearningStatus.Mastered).length,
    };

    return (
        <VocabularyContext.Provider value={{ words, progress, stats, loading, initializationError, getWordsToLearn, getWordsToReview, addWord, updateWordProgress, updateWordsProgress, markAsMastered, settings, updateSettings, resetProgress }}>
            {children}
        </VocabularyContext.Provider>
    );
};

export const useVocabulary = () => {
    const context = useContext(VocabularyContext);
    if (context === undefined) {
        throw new Error('useVocabulary must be used within a VocabularyProvider');
    }
    return context;
};
