
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Screen } from '../types';
import { HomeIcon, LearnIcon, PlusIcon, ReviewIcon, ListIcon, ScanIcon, ListeningIcon } from './icons';

interface BottomNavProps {
    currentScreen: Screen;
    setScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
    screen: Screen;
    currentScreen: Screen;
    setScreen: (screen: Screen) => void;
    icon: React.ReactNode;
    label: string;
}> = ({ screen, currentScreen, setScreen, icon, label }) => {
    const isActive = screen === currentScreen;
    return (
        <button
            onClick={() => setScreen(screen)}
            className={`flex flex-col items-center justify-center gap-1 w-full pt-2 pb-1 transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-gray-500 dark:text-dark-text-secondary'
            }`}
        >
            {icon}
            <span className="text-xs">{label}</span>
        </button>
    );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, setScreen }) => {
    const { isGuest } = useAuth();

    const navItems = [
        { screen: Screen.Home, icon: <HomeIcon />, label: 'Home' },
        { screen: Screen.Learn, icon: <LearnIcon />, label: 'Learn' },
        ...(!isGuest ? [
            { screen: Screen.AddWord, icon: <PlusIcon />, label: 'Add' },
            { screen: Screen.Scan, icon: <ScanIcon />, label: 'Scan' },
        ] : []),
        { screen: Screen.Review, icon: <ReviewIcon />, label: 'Review' },
        { screen: Screen.Listening, icon: <ListeningIcon />, label: 'Listen' },
        { screen: Screen.WordList, icon: <ListIcon />, label: 'List' },
    ];
    
    // Adjust grid columns based on number of items
    const gridColsClass = `grid-cols-${navItems.length}`;

    return (
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm border-t border-gray-200 dark:border-dark-border grid ${gridColsClass} z-20`}>
            {navItems.map(item => (
                <NavItem 
                    key={item.screen}
                    screen={item.screen}
                    currentScreen={currentScreen}
                    setScreen={setScreen}
                    icon={item.icon}
                    label={item.label}
                />
            ))}
        </nav>
    );
};

// FIX: Add a default export to make the component importable.
export default BottomNav;