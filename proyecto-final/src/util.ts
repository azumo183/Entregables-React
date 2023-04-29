import axios from "axios";
import { IParty, IPartyPokemon, ISelectedMove } from "./models/IParty";
import { User } from "firebase/auth";
import { IPokemon } from "./models/IPokemon";
import { IMove } from "./models/IMove";

export type FormControlElement = HTMLInputElement | HTMLTextAreaElement;

export const capFirst = (str: string | undefined) :string => typeof(str) !== 'undefined' ? str.charAt(0).toUpperCase() + str.slice(1) : "";

export const decode = (str: string) => window.atob(str);

export const encode = (str: string) => window.btoa(str);

export const formatedStat = (str: string) => {
    if(str === 'hp') return "HP";
    return formatedMove(str);
};

export const formatedMove = (str: string) => {
    str = capFirst(str);
    while(str.indexOf("-") >= 0){
        str = str.slice(0, str.indexOf("-")) + " " + capFirst(str.slice(str.indexOf("-")+1));
    }
    return str;
};

const devlogs_on = false;
export const devlog = (str: string) => {
    if(devlogs_on) console.log(str);
};

export const status = [
    // 0 - undefined battle, waiting for opponent
    ['Waiting for opponent confirmation', 'Challenger waiting for opponent'],
    // 1 - defined battle, waiting for both parties to be ready
    ['Let your opponent know when you are ready', 'Select a team to join the battle', 'Waiting for opponent to be ready'],
    // 2 - both parties are ready, battle starts
    ['Select an action for this turn', 'Waiting for opponent to select an action', 'Battle in process ...'],
    // 3 - battle ends
    [
        'Congratulations‼ You are the winner‼', // 0
        'You are out of Pokémon, better luck next time ...', // 1
        'Opponent gave up, you win', // 2
        'Gave up ...', // 3
        'Opponent timed out, you win', // 4
        'Timed out, you lose', // 5
    ],
    // 4 - battle dismissed
    [''],
];

export const createRandomTeam = async (authUser: User, pokedex: IPokemon[]) => {
    const party: IParty = {
        id: encode(`rand-${authUser.uid}-${Date.now()}`),
        owner: authUser.uid,
        name: 'Random Team OP ‼',
        pokemon: [],
        date: Date.now(),
    };

    while(party.pokemon.length < 6) {
        const rand = Math.floor(Math.random() * pokedex.length);
        const hp = pokedex[rand].stats.find(stat => stat.stat.name === 'hp')?.base_stat;
        const pokemon: IPartyPokemon = {
            pokemonId: pokedex[rand].id,
            nickname: capFirst(pokedex[rand].name),
            currentHP: hp? hp: 0,
            selectedMoves: [],
        };

        for(let i = 0; i < 4; i++) {
            const randMove = Math.floor(Math.random() * pokedex[rand].moves.length);
            const moveData = (await axios.get(pokedex[rand].moves[randMove].move.url)).data as IMove;
            const selectedMove: ISelectedMove = {
                moveId: moveData.id,
                currentPP: moveData.pp,
            };
            if(pokemon.selectedMoves.filter(move => move.moveId === selectedMove.moveId).length === 0) pokemon.selectedMoves.push(selectedMove);
        }

        party.pokemon.push(pokemon);
    }

    return party;
};