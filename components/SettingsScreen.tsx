
import React from 'react';
import { useVocabulary } from '../hooks/useVocabulary';
import { useAuth } from '../hooks/useAuth';
import { AppSettings, PronunciationVoice, Screen } from '../types';
import { SunIcon, MoonIcon, SignOutIcon } from './icons';

interface SettingsScreenProps {
    setScreen: (screen: Screen) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ setScreen }) => {
    const { settings, updateSettings, resetProgress } = useVocabulary();
    const { user, isGuest, signOut } = useAuth();

    const handleSettingChange = (key: keyof AppSettings, value: any) => {
        updateSettings({ [key]: value });
    };

    const handleReset = () => {
        const confirmationMessage = isGuest
            ? "Are you sure you want to reset your progress in this guest session?"
            : "Are you sure you want to reset all your learning progress for this account? This action cannot be undone.";
            
        if (window.confirm(confirmationMessage)) {
            resetProgress();
        }
    };
    
    const handleSignOut = () => {
         const confirmationMessage = isGuest
            ? "Are you sure you want to exit guest mode? Your progress in this session will be saved locally, but signing up is recommended to save it permanently."
            : "Are you sure you want to sign out?";

        if (window.confirm(confirmationMessage)) {
            signOut();
        }
    };
    
    const handleSignUpClick = () => {
        signOut();
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-dark-card rounded-lg shadow-lg animate-fade-in space-y-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-dark-text">Settings</h2>
            
            {user ? (
                <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center space-x-4">
                    <img src={user.photoURL || undefined} alt="User" className="w-12 h-12 rounded-full" />
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-dark-text">{user.displayName}</p>
                        <p className="text-sm text-gray-600 dark:text-dark-text-secondary">{user.email}</p>
                    </div>
                </div>
            ) : isGuest ? (
                <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-lg text-center">
                    <p className="font-medium text-gray-800 dark:text-dark-text mb-2">You are in Guest Mode.</p>
                    <button 
                        onClick={handleSignUpClick}
                        className="w-full px-4 py-2 bg-success text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300"
                    >
                        Sign Up to Save Your Progress Permanently
                    </button>
                </div>
            ) : null}

            {/* Theme Settings */}
            <div className="flex justify-between items-center">
                <label className="text-lg font-medium text-gray-700 dark:text-dark-text-secondary">Theme</label>
                <div className="flex items-center gap-2 p-1 bg-gray-200 dark:bg-slate-800 rounded-full">
                    <button
                        onClick={() => handleSettingChange('theme', 'light')}
                        className={`p-2 rounded-full transition-colors ${settings.theme === 'light' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                        <SunIcon />
                    </button>
                    <button
                        onClick={() => handleSettingChange('theme', 'dark')}
                        className={`p-2 rounded-full transition-colors ${settings.theme === 'dark' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                        <MoonIcon />
                    </button>
                </div>
            </div>

            {/* Pronunciation Settings */}
            <div className="flex justify-between items-center">
                <label htmlFor="defaultVoice" className="text-lg font-medium text-gray-700 dark:text-dark-text-secondary">Default Pronunciation</label>
                <select
                    id="defaultVoice"
                    value={settings.defaultVoice}
                    onChange={(e) => handleSettingChange('defaultVoice', e.target.value as PronunciationVoice)}
                    className="p-2 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-bg text-gray-800 dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-primary"
                >
                    <option value={PronunciationVoice.UK}>British (UK)</option>
                    <option value={PronunciationVoice.US}>American (US)</option>
                </select>
            </div>

            {/* Speech Speed Settings */}
            <div className="space-y-2">
                <label htmlFor="speechSpeed" className="text-lg font-medium text-gray-700 dark:text-dark-text-secondary">
                    Speech Speed: <span className="font-bold text-primary">{settings.speechSpeed.toFixed(1)}x</span>
                </label>
                <input
                    id="speechSpeed"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.speechSpeed}
                    onChange={(e) => handleSettingChange('speechSpeed', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                />
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-dark-border">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-hover transition-colors duration-300"
                >
                    <SignOutIcon />
                    <span>{isGuest ? 'Exit Guest Mode' : 'Sign Out'}</span>
                </button>
                <div>
                     <h3 className="text-xl font-semibold text-danger mb-2">Danger Zone</h3>
                     <div className="p-4 border border-danger rounded-lg flex justify-between items-center bg-red-50 dark:bg-red-900/20">
                        <div>
                            <p className="font-medium text-gray-800 dark:text-dark-text">Reset Progress</p>
                            <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                                {isGuest ? 'Resets progress for this session.' : 'This will erase all your learning data.'}
                            </p>
                        </div>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-danger text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-300"
                        >
                            Reset
                        </button>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;
