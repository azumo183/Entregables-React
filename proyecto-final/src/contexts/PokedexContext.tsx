import axios from "axios";
import React from "react";
import { IPokemon } from "../models/IPokemon";
import { devlog } from "../util";

export interface PokedexContextProps {
    pokedex: IPokemon[];
    loading: boolean;

    setPokedex: React.Dispatch<React.SetStateAction<IPokemon[]>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const PokedexContext = React.createContext<PokedexContextProps>({
    pokedex: [],
    loading: false,

    setPokedex: () => {},
    setLoading: () => {},
});

export const PokedexContextProvider: React.FC<React.PropsWithChildren> = ({children}) => {
    const [pokedex, setPokedex] = React.useState<IPokemon[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);

    const callPokeApi = React.useCallback( async () => {
        setLoading(true);
        devlog(`PokedexContext: loading pokedex ...`);
        try {
            const response: IPokemon[] = [];
            for (let i = 1; i <= 9; i++) response.push((await axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`)).data as IPokemon);
            devlog(`PokedexContext: loaded ${response.length} pokemon from api ...`);
            setPokedex(response);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        callPokeApi();
    }, [callPokeApi]);

    const contextValue = React.useMemo(
        () => ({
            pokedex, 
            loading,
            setPokedex,
            setLoading,
        }), 
        [
            pokedex, 
            loading,
            setPokedex,
            setLoading,
        ]
    );

    return (
        <PokedexContext.Provider value={contextValue}>
            {children}
        </PokedexContext.Provider>
    );
};

export const usePokedexContext = () => React.useContext<PokedexContextProps>(PokedexContext);