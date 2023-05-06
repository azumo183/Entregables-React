import React from "react";
import { IPokemon } from "../models/IPokemon";
import { callApi, devlog } from "../util";

interface PokedexContextProps {
    pokedex: IPokemon[];
    loading: boolean;

    setPokedex: React.Dispatch<React.SetStateAction<IPokemon[]>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;

    getBaseStat: (pokemonId: number, statName: string) => number;
}

const PokedexContext = React.createContext<PokedexContextProps>({
    pokedex: [],
    loading: false,

    setPokedex: () => {},
    setLoading: () => {},

    getBaseStat: () => -1,
});

export const PokedexContextProvider: React.FC<React.PropsWithChildren> = ({children}) => {
    const [pokedex, setPokedex] = React.useState<IPokemon[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    const callPokeApi = React.useCallback( async () => {
        setLoading(true);
        devlog(`PokedexContext: loading pokedex ...`);
        try {
            const ids: number[] = [];
            for (let i = 1; i <= 151; i++) ids.push(i);
            const response = await callApi(ids.map(id => `https://pokeapi.co/api/v2/pokemon/${id}`));
            const pokemon: IPokemon[] = [];
            response.forEach(element => pokemon.push(element.data as IPokemon));

            devlog(`PokedexContext: loaded ${pokemon.length} pokemon from api ...`);
            setPokedex(pokemon);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }, []);

    const getBaseStat = React.useCallback((pokemonId: number, statName: string) => {
        const baseStat = pokedex[pokemonId-1].stats.find(stat => stat.stat.name === statName)?.base_stat;
        return baseStat? baseStat : 0;
    }, [pokedex]);

    React.useEffect(() => {
        callPokeApi();
    }, [callPokeApi]);

    const contextValue = React.useMemo(
        () => ({
            pokedex, 
            loading,
            setPokedex,
            setLoading,
            getBaseStat,
        }), 
        [
            pokedex, 
            loading,
            setPokedex,
            setLoading,
            getBaseStat,
        ]
    );

    return (
        <PokedexContext.Provider value={contextValue}>
            {children}
        </PokedexContext.Provider>
    );
};

export const usePokedexContext = () => React.useContext<PokedexContextProps>(PokedexContext);