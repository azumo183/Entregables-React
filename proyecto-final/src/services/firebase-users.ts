import { User } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, onSnapshot, query, setDoc } from "firebase/firestore";
import { IUser, IUserWrapper } from "../models/IUser";

const usersRef = () => collection(getFirestore(), "users");

export const getUser = async (userId: string) => {
    try {
        return {id: userId, data: (await getDoc(doc(usersRef(), userId))).data() as IUser} as IUserWrapper;
    } catch (error) {
        console.error(error);
    }
    return undefined;
};

export const getUsers = async () => {
    try {
        const firebaseQuery = query(usersRef());
        const querySnapshot = await getDocs(firebaseQuery);
        const users: IUserWrapper[] = [];
        querySnapshot.docs.forEach(doc => users.push({id: doc.id, data: doc.data() as IUser}));
        return users;
    } catch (error) {
        console.error(error);
    }
    return [];
};

export const getUsersLive = (setState: React.Dispatch<React.SetStateAction<IUserWrapper[]>>) => {
    onSnapshot(usersRef(), snapshot => {
        //console.log(snapshot);
        const users: IUserWrapper[] = [];
        snapshot.docs.forEach(doc => users.push({id: doc.id, data: doc.data() as IUser} as IUserWrapper));
        setState(users);
    }, err => {
        console.error(err);
    });
};

export const setUser = async (firebaseUser: User, displayName: string) => {
    try {
        await setDoc(doc(usersRef(), firebaseUser.uid), {
            displayName: displayName,
        });
    } catch (error) {
        console.error(error);
    }
};