import { IMove } from "./IMove";
import { IPartyPokemon } from "./IParty";

export interface IPokemon {
    //abilities: IAbility[];
    height: number;
    id: number;
    moves: IMoveShort[];
    movesDetailed?: IMove[];
    name: string;
    species: {
        name: string;
        url: string;
    };
    sprites: {
        back_default: string | null;
        front_default: string | null;
        versions: {
            'generation-i': {
                'red-blue': {
                    back_default: string | null;
                    front_default: string | null;
                };
            };
            'generation-iii': {
                'firered-leafgreen': {
                    back_default: string | null;
                    front_default: string | null;
                };
            };
            'generation-v': {
                'black-white': {
                    animated: {
                        back_default: string | null;
                        front_default: string | null;
                    };
                    back_default: string | null;
                    front_default: string | null;
                };
            };
        };
    };
    stats: IStat[];
    types: IType[];
    weight: number;

    partyPokemon?: IPartyPokemon;
}

interface IStat {
    base_stat: number;
    effort: number;
    stat: {
        name: string;
        url: string;
    }
}

interface IMoveShort {
    move: {
        name: string;
        url: string;
    };
    version_group_details: IVersionGroupDetails[];
}

interface IVersionGroupDetails {
    level_learned_at: number;
    move_learn_method: {
        name: string;
        url: string;
    };
    version_group: {
        name: string;
        url: string;
    };
}

interface IType {
    slot: number;
    type: {
        name: string;
        url: string;
    }
}