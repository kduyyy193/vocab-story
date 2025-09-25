
let app;
let db;
let auth;
let initializationError: string | null = null;

try {
    const firebase = (window as any).firebase;
    
    if (!firebase || !firebase.app?.initializeApp || !firebase.firestore?.getFirestore || !firebase.auth?.getAuth) {
        throw new Error("Firebase SDKs not loaded. Check script tags in index.html.");
    }
    
    const { initializeApp } = firebase.app;
    const { getFirestore } = firebase.firestore;
    const { getAuth } = firebase.auth;

    // User-provided Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDU9MNa9BVDuXxFPx28NJiugO-Jxlj-4Ds",
        authDomain: "whatsapp-clone-85a20.firebaseapp.com",
        projectId: "whatsapp-clone-85a20",
        storageBucket: "whatsapp-clone-85a20.firebasestorage.app",
        messagingSenderId: "473857943679",
        appId: "1:473857943679:web:378d36e29eff334713374a",
        measurementId: "G-PQEDJ1TZNE"
    };

    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize Cloud Firestore and get a reference to the service
    db = getFirestore(app);

    // Initialize Firebase Authentication
    auth = getAuth(app);

} catch (error) {
    console.error("Firebase Initialization Error:", error);
    initializationError = (error as Error).message;
    db = {}; 
    auth = {};
}

export { db, auth, initializationError };