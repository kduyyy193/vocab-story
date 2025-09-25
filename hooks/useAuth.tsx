
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../firebase';

interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

interface AuthContextType {
    user: User | null;
    isGuest: boolean;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    signInAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const { GoogleAuthProvider, signInWithPopup, signOut: firebaseSignOut, onAuthStateChanged } = (window as any).firebase.auth;

const GUEST_SESSION_KEY = 'vocabMasterGuestSession';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isGuest, setIsGuest] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for guest session first
        const guestSession = sessionStorage.getItem(GUEST_SESSION_KEY);
        if (guestSession === 'true') {
            setIsGuest(true);
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (user) {
                // If a user logs in, they are no longer a guest
                setIsGuest(false);
                sessionStorage.removeItem(GUEST_SESSION_KEY);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error("Error during Google sign-in:", error);
            if (error.code === 'auth/unauthorized-domain') {
                alert(
                    'Sign-in failed: This domain is not authorized for OAuth operations.\n\n' +
                    'ACTION REQUIRED:\n' +
                    '1. Go to your Firebase Console.\n' +
                    '2. Navigate to Authentication -> Settings -> Authorized domains.\n' +
                    '3. Click "Add domain" and add the domain this app is running on.'
                );
            }
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setIsGuest(false);
            sessionStorage.removeItem(GUEST_SESSION_KEY);
        } catch (error) {
            console.error("Error during sign-out:", error);
        }
    };
    
    const signInAsGuest = () => {
        setLoading(true);
        setIsGuest(true);
        sessionStorage.setItem(GUEST_SESSION_KEY, 'true');
        setUser(null);
        setLoading(false);
    };
    
    return (
        <AuthContext.Provider value={{ user, isGuest, loading, signInWithGoogle, signOut, signInAsGuest }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
