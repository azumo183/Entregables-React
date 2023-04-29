import React from "react";
import { FirebaseApp, initializeApp, getApps, getApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export interface IFirebaseContextProps {
    firebaseApp: FirebaseApp | null;
    firebaseAuth: Auth | null;
}

const initFirebase = () => {
    if (!app || getApps().length === 0) {
        app = initializeApp({
            apiKey: "AIzaSyDlXewxGHE2U0VGiBoMPvSNRJ-kDuwVmQQ",
            authDomain: "pokemon-showdown-rip-off.firebaseapp.com",
            projectId: "pokemon-showdown-rip-off",
            storageBucket: "pokemon-showdown-rip-off.appspot.com",
            messagingSenderId: "522393005402",
            appId: "1:522393005402:web:a15f0090855d8c00675763",
            measurementId: "G-EHGSTW6FD7",
        });
    }

    return app;
};

const FirebaseContext = React.createContext<IFirebaseContextProps>({
    firebaseApp: initFirebase(),
    firebaseAuth: null,
});

export const FirebaseContextProvider: React.FC<React.PropsWithChildren> = ({children}) => {
    const [firebaseApp, setFirebaseApp] = React.useState<FirebaseApp | null>(app);
    const [firebaseAuth, setFirebaseAuth] = React.useState<Auth | null>(auth);

    React.useEffect(() => {
        if (!firebaseApp) setFirebaseApp(initFirebase());
        if (firebaseApp) getAnalytics(getApp());
    }, [firebaseApp]);

    React.useEffect(() => {
        if (!firebaseAuth) setFirebaseAuth(getAuth());
    }, [firebaseAuth]);

    const contextValue: IFirebaseContextProps = {
        firebaseApp,
        firebaseAuth,
    };

    return (
        <FirebaseContext.Provider value={contextValue}>
            {children}
        </FirebaseContext.Provider>
    );
};

export const useFirebase = () => React.useContext<IFirebaseContextProps>(FirebaseContext);