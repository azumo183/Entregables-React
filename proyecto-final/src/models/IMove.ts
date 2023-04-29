import { ISelectedMove } from "./IParty";

export interface IMove {
    accuracy: number; // 100
    contest_combos: null;
    contest_effect: {
        url: string;
    };
    contest_type: {
        name: string;
        url: string;
    };
    damage_class: {
        name: string; //normal | special
        url: string;
    }
    effect_chance: null;
    effect_changes: any[];
    effect_entries: IEffectEntry[];
    flavor_text_entries: IFlavorTextEntry[];
    generation: {
        name: string;
        url: string;
    };
    id: number; // 13
    learned_by_pokemon: IPokemonShort[];
    machine: IMachine[];
    meta: {
        ailment: {
            name: string;
            url: string;
        };
        ailment_chance: number;
        category: {
            name: string; // damage
            url: string;
        };
        crit_rate: number;
        drain: number;
        flinch_chance: number;
        healing: number;
        max_hits: number | null;
        max_turns: number | null;
        min_hits: number | null;
        min_turns: number | null;
        stat_chance: number;
    };
    name: string; // razon-wind
    names: IName[];
    past_values: IPastValue[];
    power: number; // 80
    pp: number; // 10
    priority: number;
    stat_changes: any[];
    super_contest_effect: {
        url: string;
    };
    target: {
        name: string; // all-opponents
        url: string;
    };
    type: {
        name: string; // normal
        url: string;
    }

    partyPokemonMove?: ISelectedMove;
}

interface IEffectEntry {
    effect: string;
    language: {
        name: string;
        url: string;
    };
    short_effect: string;
}

interface IFlavorTextEntry {
    flavor_text: string; // Blades of wind hit\nthe foe on the 2nd\nturn. It has a high\ncritical-hit ratio.
    language: {
        name: string;
        url: string;
    };
    version_group: {
        name: string;
        url: string;
    };
}

interface IPokemonShort {
    name: string;
    url: string;
}

interface IMachine {
    machine: {
        url: string;
    };
    version_group: {
        name: string;
        url: string;
    };
}

interface IName {
    language: {
        name: string;
        url: string;
    };
    name: string;
}

interface IPastValue {
    accuracy: string;
    effect_chance: null;
    effect_entries: any[];
    power: null;
    pp: null;
    type: null;
    version_group: {
        name: string;
        url: string;
    };
}