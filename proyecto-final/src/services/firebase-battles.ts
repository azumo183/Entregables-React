import {
    addDoc,
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
    or,
    runTransaction,
    setDoc,
    onSnapshot,
    getDoc,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { decode, sortByDate } from "../util";
import { IAction, IBattle, IPlayer } from "../models/IBattle";

const battlesRef = () => collection(getFirestore(), "battles");

const battlesQuery = (firebaseUser: User) => query(battlesRef(),
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

export const getBattle = async (firebaseUser: User, battleId: string) => {
    const firebaseQuery = query(battlesRef(),
        where("id", "==", battleId)
    );

    const querySnapshot = await getDocs(firebaseQuery);
    return querySnapshot.docs.length > 0 ? querySnapshot.docs[0].data() as IBattle : undefined;
};

export const getBattleLive = async (battleId: string, battleRef: React.MutableRefObject<IBattle | undefined>, setLoading: React.Dispatch<React.SetStateAction<boolean>>, setActions: React.Dispatch<React.SetStateAction<IAction[]>>) => {
    onSnapshot((await getDoc(doc(battlesRef(), battleId))).ref, snapshot => {
        setLoading(true);
        console.log(`firebase-battles: changes detected, updating battle ...`);
        const battle: IBattle = snapshot.data() as IBattle;
        battleRef.current = battle;
        setLoading(false);
        setActions([battle.player1.action as IAction, (battle.player2 as IPlayer).action as IAction]);
    }, err => {
        console.error(err);
    });
};

export const getBattles = async (firebaseUser: User) => {
    const querySnapshot = await getDocs(battlesQuery(firebaseUser));
    const battles: IBattle[] = [];

    querySnapshot.forEach((doc) => {
        battles.push(doc.data() as IBattle);
    });

    return battles.sort((a, b) => {
        if(a.date >= b.date) return 1;
        else return -1;
    });
};

export const getBattlesLive = (firebaseUser: User, setState: React.Dispatch<React.SetStateAction<IBattle[]>>) => {
    onSnapshot(battlesQuery(firebaseUser), snapshot => {
        //console.log(snapshot);
        const battles: IBattle[] = [];
        snapshot.docs.forEach(doc => battles.push(doc.data() as IBattle));
        setState(battles.sort(sortByDate));
    }, err => {
        console.error(err);
    });
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

export const updateBattle = async (battle: IBattle, changes: Object, firebaseUser: User, merge: boolean) => {
    try {
        await setDoc(doc(battlesRef(), battle.id), changes, { merge: merge });
    } catch (error) {
        console.error(error);
    }
};

export const updateBattlePlayer2 = async (battle: IBattle, firebaseUser: User) => {
    try {
        const battleRef = doc(battlesRef(), battle.id)
        await runTransaction(getFirestore(), async t => {
            const docRef = await t.get(battleRef);
            const player2 = docRef.data()?.player2;
            if (player2 === '-any-' || player2 === firebaseUser.uid) t.update(battleRef, { player2: battle.player2, status: battle.status });
            else throw Object.assign(new Error('Challenge already taken by another player'));
        });
        console.log(`Transaction success: Player2 set to ${battle.player2}`);
    } catch (e) {
        console.error('Transaction failure:', e);
        alert(e);
    }
};

export const checkBothPlayersReady = async (battle: IBattle) => {
    try {
        const battleRef = doc(battlesRef(), battle.id)
        await runTransaction(getFirestore(), async t => {
            const docRef = await t.get(battleRef);
            const p1Status = docRef.data()?.player1.status;
            const p2Status = docRef.data()?.player2.status;
            if (p1Status === 2 && p2Status === 2) t.update(battleRef, { status: 2 });
            else throw Object.assign(new Error('Players are not ready yet'));
        });
        console.log(`Both players ready!`);
        return true;
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

