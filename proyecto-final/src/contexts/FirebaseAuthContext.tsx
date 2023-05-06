import React from "react";
import {
    User,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    getAuth,
    createUserWithEmailAndPassword,
    signOut,
    updatePassword,
    sendPasswordResetEmail,
} from "firebase/auth";

export interface IFirebaseAuthContextProps {
    authUser: User | undefined;
    authToken: string | null;
    loadingAuthUser: boolean;
    login: (email: string, password: string, checking?: boolean) => Promise<boolean>;
    signup: (email: string, password: string) => Promise<boolean>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (newPassword: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
}

const FirebaseAuthContext = React.createContext<IFirebaseAuthContextProps>({
    authUser: undefined,
    authToken: null,
    loadingAuthUser: true,
    login: async () => false,
    signup: async () => false,
    loginWithGoogle: async () => {},
    logout: async () => {},
    resetPassword: async () => {},
    forgotPassword: async () => {},
});

export const FirebaseAuthContextProvider: React.FC<React.PropsWithChildren> = ({children}) => {
    const [authUser, setAuthUser] = React.useState<User | undefined>(undefined);
    const [authToken, setAuthToken] = React.useState<string | null>(null);
    const [loadingAuthUser, setLoadingAuthUser] = React.useState(true);

    const signup = async (email: string, password: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
            setAuthUser(userCredential.user);
            const token = await userCredential.user.getIdToken();
            setAuthToken(token);
            return true;
        } catch (error) {
            console.error(error);
        }
        return false;
    };

    const login = async (email: string, password: string, checking?: boolean) => {
        try {
            const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
            if(checking) return true;
            setAuthUser(userCredential.user);
            const token = await userCredential.user.getIdToken();
            setAuthToken(token);
            return true;
        } catch (error) {
            console.error(error);
        }
        return false;
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(getAuth(), provider);

            setAuthUser(userCredential.user);
            const token = await userCredential.user.getIdToken();
            setAuthToken(token);
        } catch (error) {
            console.error(error);
        }
    };

    const logout = async () => {
        try {
            await signOut(getAuth());
        } catch (error) {
            console.error(error);
        }
    };

    const resetPassword = async (newPassword: string) => {
        try {
            const user = getAuth().currentUser;
            if(user) await updatePassword(user, newPassword);
        } catch (error) {
            console.error(error);
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            await sendPasswordResetEmail(getAuth(), email);
        } catch (error) {
            console.error(error);
        }
    };

    const authStateChanged = async (user: User | null) => {
        //console.log(user);
        if (user) {
            setAuthUser(user);
            const token = await user.getIdToken();
            setAuthToken(token);
        } else {
            setAuthUser(undefined);
            setAuthToken(null);
            setLoadingAuthUser(false);
        }
    };

    React.useEffect(() => {
        //console.log(getAuth());
        if(getAuth().currentUser) setLoadingAuthUser(false);
        const unsubscribe = getAuth().onAuthStateChanged(authStateChanged);
        return () => unsubscribe();
    }, [authUser]);

    const contextValue: IFirebaseAuthContextProps = {
        authUser,
        authToken,
        loadingAuthUser,
        login,
        signup,
        loginWithGoogle,
        logout,
        resetPassword,
        forgotPassword,
    };

    return (
        <FirebaseAuthContext.Provider value={contextValue}>
            {children}
        </FirebaseAuthContext.Provider>
    );
};

export const useFirebaseAuth = () => React.useContext<IFirebaseAuthContextProps>(FirebaseAuthContext);