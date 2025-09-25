
import React from 'react';
import { Screen } from '../types';
import { SettingsIcon } from './icons';

interface MobileHeaderProps {
    currentScreen: Screen;
    setScreen: (screen: Screen) => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ currentScreen, setScreen }) => {
    return (
        <header className="md:hidden sticky top-0 z-10 flex items-center justify-between p-4 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm border-b border-gray-200 dark:border-dark-border">
            <h1 className="text-lg font-bold text-gray-800 dark:text-dark-text">
                {currentScreen}
            </h1>
            <button 
                onClick={() => setScreen(Screen.Settings)} 
                className="p-2 rounded-full text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-card"
                aria-label="Open settings"
            >
                <SettingsIcon />
            </button>
        </header>
    );
};

export default MobileHeader;
