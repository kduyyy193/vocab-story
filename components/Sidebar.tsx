
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Screen } from '../types';
import { HomeIcon, LearnIcon, ReviewIcon, IpaIcon, StatsIcon, SettingsIcon, ExerciseIcon, ListIcon, PlusIcon, ScanIcon, ListeningIcon } from './icons';

interface SidebarProps {
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
            className={`flex items-center w-full gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive 
                ? 'bg-primary text-white shadow-lg' 
                : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-card'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ currentScreen, setScreen }) => {
    const { user, isGuest, signOut } = useAuth();

    const navItems = [
        { screen: Screen.Home, icon: <HomeIcon />, label: 'Home' },
        ...(!isGuest ? [
            { screen: Screen.AddWord, icon: <PlusIcon />, label: 'Add New Word' },
            { screen: Screen.Scan, icon: <ScanIcon />, label: 'Scan Vocabulary' },
        ] : []),
        { screen: Screen.Learn, icon: <LearnIcon />, label: 'Learn Words' },
        { screen: Screen.WordList, icon: <ListIcon />, label: 'Word List' },
        { screen: Screen.Review, icon: <ReviewIcon />, label: 'Review Session' },
        { screen: Screen.Exercises, icon: <ExerciseIcon />, label: 'Practice' },
        { screen: Screen.Listening, icon: <ListeningIcon />, label: 'Listening Practice' },
        { screen: Screen.IpaChart, icon: <IpaIcon />, label: 'IPA Chart' },
        { screen: Screen.Stats, icon: <StatsIcon />, label: 'Statistics' },
    ];
    
    const handleSignUpClick = () => {
        // Signing out as guest will redirect to the login screen
        signOut();
    };

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border p-4">
            <div className="text-2xl font-bold text-primary mb-8 px-2">
                Vocab Master
            </div>
            <nav className="flex flex-col space-y-2 flex-grow">
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
            <div className="mt-auto space-y-2">
                 <NavItem 
                    screen={Screen.Settings} 
                    currentScreen={currentScreen} 
                    setScreen={setScreen}
                    icon={<SettingsIcon />}
                    label="Settings"
                />
                {user ? (
                    <div className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
                        <img src={user.photoURL || undefined} alt="User" className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-dark-text truncate">{user.displayName}</p>
                            <p className="text-xs text-gray-500 dark:text-dark-text-secondary truncate">{user.email}</p>
                        </div>
                    </div>
                ) : isGuest ? (
                    <button 
                        onClick={handleSignUpClick}
                        className="w-full px-4 py-3 bg-success text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300"
                    >
                        Sign Up to Save Progress
                    </button>
                ) : null}
            </div>
        </aside>
    );
};

export default Sidebar;