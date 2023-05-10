import React, { PropsWithChildren } from 'react'
import { IUserWrapper } from '../models/IUser'
import { getUsersLive } from '../services/firebase-users';

interface IFirebaseUserContext {
    users: IUserWrapper[];
    getUserDisplayName: (userId: string) => string | undefined;
}

const FirebaseUsersContex = React.createContext<IFirebaseUserContext>({
    users: [],
    getUserDisplayName: () => '',
});

export const FirebaseUsersContextProvider: React.FC<PropsWithChildren> = ({children}) => {
    const [ users, setUsers ] = React.useState<IUserWrapper[]>([]);

    const getUserDisplayName = React.useCallback((userId: string) => {
        if(userId === '-bot-') return 'Malevolent AI';
        else if(userId === 'guest') return 'Mysterious Pokémon Trainer';
        return users.find(user => user.id === userId)?.data.displayName;
    }, [users]);

    React.useEffect(() => {
        getUsersLive(setUsers);
    }, []);

    const contextValue = React.useMemo(() => ({ users, getUserDisplayName }), [ users, getUserDisplayName ]);

    return (
        <FirebaseUsersContex.Provider value={contextValue}>
            {children}
        </FirebaseUsersContex.Provider>
    )
}

export const useFirebaseUsersContext = () => React.useContext(FirebaseUsersContex);
