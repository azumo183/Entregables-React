export interface IParty {
    id: string;
    owner: string;
    name: string;
    pokemon: IPartyPokemon[];
    date: number;
}

export interface IPartyPokemon {
    pokemonId: number;
    nickname: string;
    currentHP: number;
    selectedMoves: ISelectedMove[];
}

export interface ISelectedMove {
    moveId: number;
    currentPP: number;
}