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

export interface IApiMoveDetailed {
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
}

export interface IApiPokemon {
    abilities: IAbility[];
    base_experience: number;
    forms: IForm[];
    game_indices: IGameIndex[];
    height: number;
    held_items: IItem[];
    id: number;
    is_default: boolean;
    location_area_encounters: string;
    moves: IMove[];
    name: string;
    order: number;
    past_types: IPastType[];
    species: {
        name: string;
        url: string;
    };
    sprites: {
        back_default: string | null;
        back_female: string | null;
        back_shiny: string | null;
        back_shiny_female: string | null;
        front_default: string | null;
        front_female: string | null;
        front_shiny: string | null;
        front_shiny_female: string | null;
        other: {
            dream_world: {
                front_default: string | null;
                front_female: string | null;
            };
            home: {
                front_default: string | null;
                front_female: string | null;
                front_shiny: string | null;
                front_shiny_female: string | null;
            };
            'official-artwork': { 
                front_default: string | null;
                front_shiny: string | null;
            };
        };
        versions: {
            'generation-i': {
                'red-blue': {
                    back_default: string | null;
                    back_gray: string | null;
                    back_transparent: string | null;
                    front_default: string | null;
                    front_gray: string | null;
                    front_transparent: string | null;
                };
                yellow: {
                    back_default: string | null;
                    back_gray: string | null;
                    back_transparent: string | null;
                    front_default: string | null;
                    front_gray: string | null;
                    front_transparent: string | null;
                };
            };
            'generation-ii': {
                crystal: {
                    back_default: string | null;
                    back_shiny: string | null;
                    back_shiny_transparent: string | null;
                    back_transparent: string | null;
                    front_default: string | null;
                    front_shiny: string | null;
                    front_shiny_transparent: string | null;
                    front_transparent: string | null;
                };
                gold: {
                    back_default: string | null;
                    back_shiny: string | null;
                    front_default: string | null;
                    front_shiny: string | null;
                    front_transparent: string | null;
                };
                silver: {
                    back_default: string | null;
                    back_shiny: string | null;
                    front_default: string | null;
                    front_shiny: string | null;
                    front_transparent: string | null;
                };
            };
            'generation-iii': {
                emerald: {
                    front_default: string | null;
                    front_shiny: string | null;
                };
                'firered-leafgreen': {
                    back_default: string | null;
                    back_shiny: string | null;
                    front_default: string | null;
                    front_shiny: string | null;
                };
                'ruby-sapphire': {
                    back_default: string | null;
                    back_shiny: string | null;
                    front_default: string | null;
                    front_shiny: string | null;
                };
            };
            'generation-iv': {
                'diamond-pearl': {
                    back_default: string | null;
                    back_female: string | null;
                    back_shiny: string | null;
                    back_shiny_female: string | null;
                    front_default: string | null;
                    front_female: string | null;
                    front_shiny: string | null;
                    front_shiny_female: string | null;
                };
                'heartgold-soulsilver': {
                    back_default: string | null;
                    back_female: string | null;
                    back_shiny: string | null;
                    back_shiny_female: string | null;
                    front_default: string | null;
                    front_female: string | null;
                    front_shiny: string | null;
                    front_shiny_female: string | null;
                };
                platinum: {
                    back_default: string | null;
                    back_female: string | null;
                    back_shiny: string | null;
                    back_shiny_female: string | null;
                    front_default: string | null;
                    front_female: string | null;
                    front_shiny: string | null;
                    front_shiny_female: string | null;
                };
            };
            'generation-v': {
                'black-white': {
                    animated: {
                        back_default: string | null;
                        back_female: string | null;
                        back_shiny: string | null;
                        back_shiny_female: string | null;
                        front_default: string | null;
                        front_female: string | null;
                        front_shiny: string | null;
                        front_shiny_female: string | null;
                    };
                    back_default: string | null;
                    back_female: string | null;
                    back_shiny: string | null;
                    back_shiny_female: string | null;
                    front_default: string | null;
                    front_female: string | null;
                    front_shiny: string | null;
                    front_shiny_female: string | null;
                };
            };
            'generation-vi': {
                'omegaruby-alphasapphire': {
                    front_default: string | null;
                    front_female: string | null;
                    front_shiny: string | null;
                    front_shiny_female: string | null;
                };
                'x-y': {
                    front_default: string | null;
                    front_female: string | null;
                    front_shiny: string | null;
                    front_shiny_female: string | null;
                };
            };
            'generation-vii': {
                icons: {
                    front_default: string | null;
                    front_female: string | null;
                };
                'ultra-sun-ultra-moon': {
                    front_default: string | null;
                    front_female: string | null;
                    front_shiny: string | null;
                    front_shiny_female: string | null;
                };
            };
            'generation-viii': {
                icons: {
                    front_default: string | null;
                    front_female: string | null;
                };
            };
        };
    };
    stats: IStat[];
    types: IType[];
    weight: number;
}

interface IAbility {
    ability: {
        name: string;
        url: string;
    };
    is_hidden: boolean;
    slot: number;
}

interface IForm {
    name: string;
    url: string;
}

interface IGameIndex {
    game_index: number;
    version: {
        name: string;
        url: string;
    };
}

interface IItem {
    item: {
        name: string;
        url: string;
    };
    version_details: IVersionDetails[];
}

interface IVersionDetails {
    rarity: number;
    version: {
        name: string;
        url: string;
    };
}

interface IMove {
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

interface IPastType {
    generation: {
        name: string;
        url: string;
    };
    types: IType[];
}

interface IStat {
    base_stat: number;
    effort: number;
    stat: {
        name: string;
        url: string;
    }
}

interface IType {
    slot: number;
    type: {
        name: string;
        url: string;
    }
}