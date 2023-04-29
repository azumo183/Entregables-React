import React from "react";
import { IParty, IPartyPokemon, ISelectedMove } from "../models/IParty";
import { useFirebaseAuth } from "./FirebaseAuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { getTeam, saveTeam } from "../services/firebase";
import { IPokemon } from "../models/IPokemon";
import { capFirst, decode } from "../util";
import { IMove } from "../models/IMove";

export interface TeambuilderContextProps {
    team: IParty | undefined;
    loadingTeam: boolean;
    showModal: string;
    deletingPokemon: IPokemon | undefined;
    workingOnPokemon: IPokemon | undefined;
    deletingMove: IMove | undefined;

    setTeam: React.Dispatch<React.SetStateAction<IParty | undefined>>;
    setLoadingTeam: React.Dispatch<React.SetStateAction<boolean>>;
    setShowModal: React.Dispatch<React.SetStateAction<string>>;
    setDeletingPokemon: React.Dispatch<React.SetStateAction<IPokemon | undefined>>;
    setWorkingOnPokemon: React.Dispatch<React.SetStateAction<IPokemon | undefined>>;
    setDeletingMove: React.Dispatch<React.SetStateAction<IMove | undefined>>;

    handleAddPokemonToTeam: (pokemon: IPokemon) => void;
    handleMovePick: (move: IMove) => void;
    handlePokemonDelete: () => void;
    handleMoveDelete: () => void;
    handleNicknameChange: (pokemon: IPokemon, newNickname: string) => void;
    handleTeamSave: () => void;
}

const TeambuilderContext = React.createContext<TeambuilderContextProps>({
    team: undefined,
    loadingTeam: true,
    showModal: 'false',
    deletingPokemon: undefined,
    workingOnPokemon: undefined,
    deletingMove: undefined,

    setTeam: () => {},
    setLoadingTeam: () => {},
    setShowModal: () => {},
    setDeletingPokemon: () => {},
    setWorkingOnPokemon: () => {},
    setDeletingMove: () => {},

    handleAddPokemonToTeam: () => {},
    handleMovePick: () => {},
    handlePokemonDelete: () => {},
    handleMoveDelete: () => {},
    handleNicknameChange: () => {},
    handleTeamSave: () => {},
});

export const TeambuilderContextProvider: React.FC<React.PropsWithChildren> = ({children}) => {
    const [ team, setTeam ] = React.useState<IParty>();
    const [ loadingTeam, setLoadingTeam ] = React.useState(true);
    const [ showModal, setShowModal ] = React.useState<string>('false'); // 'false', 'pokedex', 'moves', 'del_pokemon', 'del_move'
    const [ deletingPokemon, setDeletingPokemon ] = React.useState<IPokemon>();
    const [ workingOnPokemon, setWorkingOnPokemon ] = React.useState<IPokemon>();
    const [ deletingMove, setDeletingMove ] = React.useState<IMove>();

    const { authUser } = useFirebaseAuth();
    const { teamId } = useParams();
    const navigate = useNavigate();

    const loadTeam = React.useCallback(async () => {
        if (!authUser || !teamId) return;
        console.log(`TeambuilderContext: loading team ${teamId} ...`)

        if(decode(teamId).startsWith('temp-')){
            const newTeam: IParty = {
                id: teamId,
                owner: authUser.uid,
                pokemon: [],
                name: 'Awesome Pokémon Team!!',
                date: Date.now(),
            };
            setTeam(newTeam);
            setLoadingTeam(false);
            return;
        }

        try {
            setLoadingTeam(true);
            const fbTeam = await getTeam(authUser, teamId);
            setTeam(fbTeam);
            setLoadingTeam(false);
        } catch (error) {
            console.error(error);
        }
    }, [authUser, teamId]);

    const handleAddPokemonToTeam = React.useCallback((pokemon: IPokemon) => {
        console.log(`handleAddPokemonToTeam`);
        if(!team) return;
        const newTeam = team;

        const hp = pokemon.stats.find(stat => stat.stat.name === 'hp');
        
        pokemon.partyPokemon = {
            pokemonId: pokemon.id,
            nickname: capFirst(pokemon.name),
            currentHP: hp? hp.base_stat : 0,
            selectedMoves: [],
        };

        newTeam.pokemon.push(pokemon.partyPokemon);

        setTeam(newTeam);
        setShowModal('false');
    }, [team]);

    const handleMovePick = React.useCallback((move: IMove) => {
        console.log(`handleMovePick`);
        if(!team || !workingOnPokemon) return;
        const newTeam = team;

        move.partyPokemonMove = {
            moveId: move.id,
            currentPP: move.pp,
        };

        newTeam.pokemon[newTeam.pokemon.indexOf(workingOnPokemon.partyPokemon as IPartyPokemon)].selectedMoves.push(move.partyPokemonMove);

        setTeam(newTeam);
        setShowModal('false');
    }, [team, workingOnPokemon]);

    const handlePokemonDelete = React.useCallback(() => {
        console.log(`handlePokemonDelete`);
        if(!team || !deletingPokemon) return;
        const newTeam = team;

        newTeam.pokemon.splice(newTeam.pokemon.indexOf((deletingPokemon as IPokemon).partyPokemon as IPartyPokemon), 1);
        //console.log(newTeam);

        setTeam(newTeam);
        setShowModal('false');
    }, [team, deletingPokemon]);

    const handleMoveDelete = React.useCallback(() => {
        console.log(`handleMoveDelete`);
        if(!team || !deletingMove) return;
        const newTeam = team;
        
        const pokemon = newTeam.pokemon[newTeam.pokemon.indexOf((workingOnPokemon as IPokemon).partyPokemon as IPartyPokemon)];
        pokemon.selectedMoves.splice(pokemon.selectedMoves.indexOf(((deletingMove as IMove).partyPokemonMove as ISelectedMove)), 1);
        //console.log(pokemon.selectedMoves);

        setTeam(newTeam);
        setShowModal('false');
    }, [team, deletingMove, workingOnPokemon]);

    const handleNicknameChange = React.useCallback((pokemon: IPokemon, newNickname: string) => {
        console.log(`handleNicknameChange`);
        if(!team) return;
        const newTeam = team;
        //const pre = newTeam.pokemon[newTeam.pokemon.indexOf(pokemon.partyPokemon as IPartyPokemon)].nickname;
        newTeam.pokemon[newTeam.pokemon.indexOf(pokemon.partyPokemon as IPartyPokemon)].nickname = newNickname;
        //console.log(`${pre} => ${newTeam.pokemon[newTeam.pokemon.indexOf(pokemon.partyPokemon as IPartyPokemon)].nickname}`);
        setTeam(newTeam);
    }, [team]);

    const handleTeamSave = React.useCallback(async () => {
        console.log(`handleTeamSave`);
        if(!team || !authUser) return;
        try {
            await saveTeam(team, authUser);
            navigate('/teambuilder');
        } catch (error) {
            console.error(error);   
        }
    }, [authUser, team, navigate]);

    React.useEffect(() => { 
        loadTeam();
    }, [loadTeam]);

    const contextValue = React.useMemo(
        () => ({
            team, 
            loadingTeam,
            showModal,
            deletingPokemon,
            workingOnPokemon,
            deletingMove,

            setTeam,
            setLoadingTeam,
            setShowModal,
            setDeletingPokemon,
            setWorkingOnPokemon,
            setDeletingMove,

            handleAddPokemonToTeam,
            handleMovePick,
            handlePokemonDelete,
            handleMoveDelete,
            handleNicknameChange,
            handleTeamSave,
        }), 
        [
            team, 
            loadingTeam,
            showModal,
            deletingPokemon,
            workingOnPokemon, 
            deletingMove,

            setTeam,
            setLoadingTeam,
            setShowModal,
            setDeletingPokemon,
            setWorkingOnPokemon,
            setDeletingMove, 

            handleAddPokemonToTeam,
            handleMovePick,
            handlePokemonDelete,
            handleMoveDelete,
            handleNicknameChange,
            handleTeamSave,
        ]
    );

    return (
        <TeambuilderContext.Provider value={contextValue}>
            {children}
        </TeambuilderContext.Provider>
    );
};

export const useTeambuilderContext = () => React.useContext<TeambuilderContextProps>(TeambuilderContext);