
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { GoogleIcon } from './icons';

const LoginScreen: React.FC = () => {
    const { signInWithGoogle, signInAsGuest } = useAuth();

    return (
        <div className="flex items-center justify-center min-h-screen bg-light dark:bg-dark-bg p-4">
            <div className="w-full max-w-sm text-center p-8 bg-white dark:bg-dark-card rounded-2xl shadow-xl animate-fade-in">
                <h1 className="text-3xl font-bold text-primary mb-2">Vocab Master</h1>
                <p className="text-gray-600 dark:text-dark-text-secondary mb-8">Sign in to sync your progress or try as a guest.</p>
                
                <div className="space-y-4">
                    <button
                        onClick={signInWithGoogle}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-dark-border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                        <GoogleIcon />
                        <span className="font-semibold text-gray-700 dark:text-dark-text">Sign in with Google</span>
                    </button>

                    <button
                        onClick={signInAsGuest}
                        className="w-full px-4 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-hover transition-colors duration-300"
                    >
                        Continue as Guest
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
