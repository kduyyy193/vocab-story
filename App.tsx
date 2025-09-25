
import React, { useState, useEffect } from 'react';
import { useVocabulary, VocabularyProvider } from './hooks/useVocabulary';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Screen } from './types';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import BottomNav from './components/BottomNav';
import HomeScreen from './components/HomeScreen';
import LearnScreen from './components/LearnScreen';
import ReviewScreen from './components/ReviewScreen';
import IpaChartScreen from './components/IpaChartScreen';
import StatsScreen from './components/StatsScreen';
import SettingsScreen from './components/SettingsScreen';
import ExercisesScreen from './components/ExercisesScreen';
import WordListScreen from './components/WordListScreen';
import AddWordScreen from './components/AddWordScreen';
import LoginScreen from './components/LoginScreen';
import ScanScreen from './components/ScanScreen';
import ListeningScreen from './components/ListeningScreen';

const MainApp: React.FC = () => {
    const [screen, setScreen] = useState<Screen>(Screen.Home);
    const { settings, loading, initializationError } = useVocabulary();

    useEffect(() => {
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [settings.theme]);
    
    if (initializationError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-dark-bg p-4">
                <div className="max-w-2xl text-center p-8 bg-white dark:bg-dark-card rounded-lg shadow-lg border-t-4 border-danger">
                    <h1 className="text-2xl font-bold text-danger mb-4">Firebase Configuration Error</h1>
                    <p className="text-gray-700 dark:text-dark-text-secondary mb-2">
                        Could not connect to the database. This might be due to incorrect Firebase credentials or network issues.
                    </p>
                    <p className="text-gray-600 dark:text-dark-text-secondary">
                        Please ensure the configuration in <code className="bg-gray-200 dark:bg-slate-700 p-1 rounded text-sm">firebase.ts</code> is correct and your network allows access to Firebase.
                    </p>
                </div>
            </div>
        );
    }
    
    if (loading) {
         return (
            <div className="flex items-center justify-center min-h-screen bg-light dark:bg-dark-bg">
                <p className="text-lg text-gray-600 dark:text-dark-text-secondary">Loading your vocabulary...</p>
            </div>
        );
    }


    const renderScreen = () => {
        switch (screen) {
            case Screen.Home:
                return <HomeScreen setScreen={setScreen} />;
            case Screen.AddWord:
                return <AddWordScreen setScreen={setScreen} />;
            case Screen.Scan:
                return <ScanScreen />;
            case Screen.Learn:
                return <LearnScreen />;
            case Screen.WordList:
                return <WordListScreen />;
            case Screen.Review:
                return <ReviewScreen />;
            case Screen.Exercises:
                return <ExercisesScreen />;
            case Screen.Listening:
                return <ListeningScreen />;
            case Screen.IpaChart:
                return <IpaChartScreen />;
            case Screen.Stats:
                return <StatsScreen />;
            case Screen.Settings:
                return <SettingsScreen setScreen={setScreen} />;
            default:
                return <HomeScreen setScreen={setScreen} />;
        }
    };

    return (
        <div className="min-h-screen text-gray-800 dark:text-dark-text bg-light dark:bg-dark-bg transition-colors duration-300">
            <div className="flex">
                <Sidebar currentScreen={screen} setScreen={setScreen} />

                <div className="flex-1 md:ml-64">
                    <MobileHeader currentScreen={screen} setScreen={setScreen} />
                    <main className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
                        {renderScreen()}
                    </main>
                    <BottomNav currentScreen={screen} setScreen={setScreen} />
                </div>
            </div>
        </div>
    );
};


const AppContent: React.FC = () => {
    const { user, isGuest, loading: authLoading } = useAuth();

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-light dark:bg-dark-bg">
                <p className="text-lg text-gray-600 dark:text-dark-text-secondary">Authenticating...</p>
            </div>
        );
    }
    
    if (!user && !isGuest) {
        return <LoginScreen />;
    }
    
    return (
        <VocabularyProvider user={user} isGuest={isGuest}>
            <MainApp />
        </VocabularyProvider>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;