import { IParty } from "./IParty";

export interface IBattle {
    id: string;
    date: number;
    player1: IPlayer;
    player2: IPlayer | string;
    status: number;

    config: {
        timed: boolean;
        blind: boolean;
    };
}

export interface IPlayer {
    party: IParty | undefined;
    status: number;
    action?: IAction;
    selectedPokemon: number;
}

export interface IAction {
    type: number;   // 0 - attack   | 1 - switch | 2 - give up | 3 - faint | 4 - out of pokemon | 5 - end
    option: number; // attack slot  | party slot | undefined
    speed: number;  // attack speed | max
    data?: IActionData;
    owner: string;
    message?: string;
    resolved?: boolean;
}

export interface IActionData {
    moveName: string;
    movePower: number;
    p2GoesFirst: boolean;
}