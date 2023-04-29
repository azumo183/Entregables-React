export const x = false;

/*
import React from "react";
import { App, initializeApp, getApps } from 'firebase-admin/app'
import { Auth, getAuth } from "firebase-admin/auth";

import admin from "firebase-admin";
const serviceAccount = require('../resources/pokemon-showdown-rip-off-firebase-adminsdk-qdgjv-975390e0b0.json');

let app: App | null = null;
let auth: Auth | null = null;

export interface IFirebaseAdminContextProps {
    firebaseApp: App | null;
    firebaseAuth: Auth | null;
    users: any[];
}

const initFirebase = () => {
    if (!app || getApps().length === 0) {
        app = initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    return app;
};

const getUsers = (nextPageToken: string | undefined) => {
    getAuth()
        .listUsers(1000, nextPageToken)
        .then((listUsersResult) => {
            listUsersResult.users.forEach((userRecord) => {
                console.log('user', userRecord.toJSON());
            });
            if (listUsersResult.pageToken) getUsers(listUsersResult.pageToken);
        })
        .catch((error) => {
            console.log('Error listing users:', error);
        });
};

const FirebaseAdminContext = React.createContext<IFirebaseAdminContextProps>({
    firebaseApp: initFirebase(),
    firebaseAuth: null,
    users: [],
});

export const FirebaseAdminContextProvider: React.FC<React.PropsWithChildren> = ({children}) => {
    const [firebaseApp, setFirebaseApp] = React.useState<App | null>(app);
    const [firebaseAuth, setFirebaseAuth] = React.useState<Auth | null>(auth);
    const [users, setUsers] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (!firebaseApp) setFirebaseApp(initFirebase());
    }, [firebaseApp]);

    React.useEffect(() => {
        if (!firebaseAuth) setFirebaseAuth(getAuth());
        else getUsers(undefined);
    }, [firebaseAuth]);

    const contextValue: IFirebaseAdminContextProps = {
        firebaseApp,
        firebaseAuth,
        users,
    };

    return (
        <FirebaseAdminContext.Provider value={contextValue}>
            {children}
        </FirebaseAdminContext.Provider>
    );
};

export const useFirebase = () => React.useContext<IFirebaseAdminContextProps>(FirebaseAdminContext);
*/