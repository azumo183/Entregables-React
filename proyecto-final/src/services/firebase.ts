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
    or,
    runTransaction,
    setDoc,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { IParty } from "../models/IParty";
import { decode } from "../util";
import { IAction, IBattle, IPlayer } from "../models/IBattle";

const teamsRef = () => collection(getFirestore(), "teams");
const battlesRef = () => collection(getFirestore(), "battles");
  
export const saveTeam = async (team: IParty, firebaseUser: User) => {
    try {

        //tempId: temp + firebase.uid + timestamp
        if(decode(team.id).startsWith('temp-')) {
            const docRef = await addDoc(teamsRef(), team);
            await updateDoc(doc(teamsRef(), docRef.id), { id: docRef.id });
            console.log("Document written with ID: ", docRef.id);

        }else await updateDoc(doc(teamsRef(), team.id), { ...team });

    } catch (error) {
        console.error(error);
    }
};

export const deleteTeam = async (team: IParty, firebaseUser: User) => {
    try {
        deleteDoc(doc(teamsRef(), team.id));
    } catch (error) {
        console.error(error);
    }
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

export const saveBattle = async (battle: IBattle, firebaseUser: User) => {
    try {

        //tempId: temp + firebase.uid + timestamp
        if(decode(battle.id).startsWith('temp-')) {
            const docRef = await addDoc(battlesRef(), battle);
            await updateDoc(doc(battlesRef(), docRef.id), { id: docRef.id });
            console.log("Document written with ID: ", docRef.id);

        }else await updateDoc(doc(battlesRef(), battle.id), { ...battle });

    } catch (error) {
        console.error(error);
    }
};

export const updateBattlePlayer2 = async (battle: IBattle) => {
    try {
        const battleRef = doc(battlesRef(), battle.id)
        const res = await runTransaction(getFirestore(), async t => {
            const docRef = await t.get(battleRef);
            const player2 = docRef.data()?.player2;
            if (player2 === '-any-') {
                t.update(battleRef, { player2: battle.player2, status: battle.status });
                return `Player2 set to ${battle.player2}`;
            } else throw Object.assign(new Error('Challenge already taken by other player'));
        });
        console.log('Transaction success', res);
    } catch (e) {
        console.error('Transaction failure:', e);
    }
};

export const checkBothPlayersReady = async (battle: IBattle) => {
    try {
        const battleRef = doc(battlesRef(), battle.id)
        const res = await runTransaction(getFirestore(), async t => {
            const docRef = await t.get(battleRef);
            const p1Status = docRef.data()?.player1.status;
            const p2Status = docRef.data()?.player2.status;
            if (p1Status === 2 && p2Status === 2) {
                t.update(battleRef, { status: 2 });
                return true;
            } else return false;
        });
        console.log(`Both players ready: ${res}`);
        return res;
    } catch (e) {
        console.error(e);
    }
    return false;
};

export const getBattleActions = async (battle: IBattle) => {
    try {
        const firebaseQuery = query(battlesRef(),
            where("id", "==", battle.id)
        );
        const querySnapshot = await getDocs(firebaseQuery);
        const res: IAction[] = [];
        querySnapshot.forEach((doc) => {
            if((doc.data() as IBattle).player1.action) res.push((doc.data() as IBattle).player1.action as IAction);
            if(((doc.data() as IBattle).player2 as IPlayer).action) res.push(((doc.data() as IBattle).player2 as IPlayer).action as IAction);
        });
        return res;
    } catch (e) {
        console.error(e);
    }
    return [];
};

export const updateBattle = async (battle: IBattle, changes: Object, firebaseUser: User, merge: boolean) => {
    try {
        // let performUpdate: boolean = true;
        // if(checkP2Defined){
        //     const currentBattleData = await getBattle(firebaseUser, battle.id);
        //     if(!currentBattleData || currentBattleData.player2 !== '-any-') performUpdate = false;
        // }
        // if(!performUpdate) return;

        await setDoc(doc(battlesRef(), battle.id), changes, { merge: merge });

        //await updateDoc(doc(battlesRef(), battle.id), { ...battle });
    } catch (error) {
        console.error(error);
    }
};

export const getBattles = async (firebaseUser: User) => {
    const firebaseQuery = query(battlesRef(),
        or(
            where('player1.party.owner', '==', firebaseUser.uid),
            or(
                where('player2.party.owner', '==', firebaseUser.uid),
                or(
                    where('player2', '==', '-any-'),
                    where('player2', '==', firebaseUser.uid)
                )
            )
        ),
    );

    const querySnapshot = await getDocs(firebaseQuery);
    const battles: IBattle[] = [];

    querySnapshot.forEach((doc) => {
        battles.push(doc.data() as IBattle);
    });

    return battles.sort((a, b) => {
        if(a.date >= b.date) return 1;
        else return -1;
    });
};

export const getBattle = async (firebaseUser: User, battleId: string) => {
    const firebaseQuery = query(battlesRef(),
        where("id", "==", battleId)
    );

    const querySnapshot = await getDocs(firebaseQuery);
    return querySnapshot.docs.length > 0 ? querySnapshot.docs[0].data() as IBattle : undefined;
};