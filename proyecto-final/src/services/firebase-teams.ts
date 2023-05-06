import {
    addDoc,
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
    deleteDoc,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { IParty } from "../models/IParty";
import { decode } from "../util";

const teamsRef = () => collection(getFirestore(), "teams");
  
export const saveTeam = async (team: IParty, firebaseUser: User) => {
    try {

        //tempId: temp + firebase.uid + timestamp
        if(decode(team.id).startsWith('temp-')) {
            const docRef = await addDoc(teamsRef(), team);
            await updateDoc(doc(teamsRef(), docRef.id), { id: docRef.id });
            console.log("Document written with ID: ", docRef.id);

            //db.collection("users").doc(doc.id).update({foo: "bar"});

        }else await updateDoc(doc(teamsRef(), team.id), { ...team });

    } catch (error) {
        console.error(error);
    }
};

export const deleteTeam = async (team: IParty, firebaseUser: User) => {
    try {
        await deleteDoc(doc(teamsRef(), team.id));
        return await getTeams(firebaseUser);
    } catch (error) {
        console.error(error);
    }
    return undefined;
};
  
export const getTeams = async (firebaseUser: User) => {
    const firebaseQuery = query(collection(getFirestore(), "teams"),
        where("owner", "==", firebaseUser.uid)
    );

    const querySnapshot = await getDocs(firebaseQuery);
    const teams: IParty[] = [];

    querySnapshot.forEach((doc) => {
        teams.push(doc.data() as IParty);
    });

    return teams.sort((a, b) => {
        if(a.date >= b.date) return 1;
        else return -1;
    });
};

export const getTeam = async (firebaseUser: User, teamId: string) => {
    const firebaseQuery = query(teamsRef(),
        where("owner", "==", firebaseUser.uid),
        where("id", "==", teamId)
    );

    const querySnapshot = await getDocs(firebaseQuery);
    return querySnapshot.docs.length > 0 ? querySnapshot.docs[0].data() as IParty : undefined;
};