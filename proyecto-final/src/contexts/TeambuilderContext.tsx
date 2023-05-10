import React from "react";
import { IParty, IPartyPokemon, ISelectedMove } from "../models/IParty";
import { useFirebaseAuth } from "./FirebaseAuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { getTeam, saveTeam } from "../services/firebase-teams";
import { IPokemon } from "../models/IPokemon";
import { capFirst, decode } from "../util";
import { IMove } from "../models/IMove";

export interface TeambuilderContextProps {
    team: IParty | undefined;
    loadingTeam: boolean;
    showModal: string;
    selectedPokemon: IPokemon | undefined;
    selectedMove: IMove | undefined;

    setTeam: React.Dispatch<React.SetStateAction<IParty | undefined>>;
    setLoadingTeam: React.Dispatch<React.SetStateAction<boolean>>;
    setShowModal: React.Dispatch<React.SetStateAction<string>>;
    setSelectedPokemon: React.Dispatch<React.SetStateAction<IPokemon | undefined>>;
    setSelectedMove: React.Dispatch<React.SetStateAction<IMove | undefined>>;

    handleAddPokemon: (pokemon: IPokemon) => void;
    handleDeletePokemon: () => void;
    handleAddMove: (move: IMove) => void;
    handleDeleteMove: () => void;
    handleNicknameChange: (pokemon: IPokemon, newNickname: string) => void;
    handleTeamSave: () => void;
}

const TeambuilderContext = React.createContext<TeambuilderContextProps>({
    team: undefined,
    loadingTeam: true,
    showModal: 'false',
    selectedPokemon: undefined,
    selectedMove: undefined,

    setTeam: () => {},
    setLoadingTeam: () => {},
    setShowModal: () => {},
    setSelectedPokemon: () => {},
    setSelectedMove: () => {},

    handleAddPokemon: () => {},
    handleDeletePokemon: () => {},
    handleAddMove: () => {},
    handleDeleteMove: () => {},
    handleNicknameChange: () => {},
    handleTeamSave: () => {},
});

export const TeambuilderContextProvider: React.FC<React.PropsWithChildren> = ({children}) => {
    const [ team, setTeam ] = React.useState<IParty>();
    const [ loadingTeam, setLoadingTeam ] = React.useState(true);
    const [ showModal, setShowModal ] = React.useState<string>('false'); // 'false', 'pokedex', 'moves', 'del_pokemon', 'del_move'
    const [ selectedPokemon, setSelectedPokemon ] = React.useState<IPokemon>();
    const [ selectedMove, setSelectedMove ] = React.useState<IMove>();

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

    const handleAddPokemon = React.useCallback((pokemon: IPokemon) => {
        console.log(`handleAddPokemon`);

        const hp = pokemon.stats.find(stat => stat.stat.name === 'hp');
        
        pokemon.partyPokemon = {
            pokemonId: pokemon.id,
            nickname: capFirst(pokemon.name),
            currentHP: hp? hp.base_stat : 0,
            selectedMoves: [],
        };

        team?.pokemon.push(pokemon.partyPokemon);

        setTeam(team);
        setShowModal('false');
    }, [team]);

    const handleDeletePokemon = React.useCallback(() => {
        console.log(`handleDeletePokemon`);
        if(!selectedPokemon) return;

        team?.pokemon.splice(team.pokemon.indexOf(selectedPokemon?.partyPokemon as IPartyPokemon), 1);
        //console.log(team?.pokemon);

        setTeam(team);
        setShowModal('false');
    }, [team, selectedPokemon]);

    const handleAddMove = React.useCallback((move: IMove) => {
        console.log(`handleAddMove`);
        
        move.partyPokemonMove = {
            moveId: move.id,
            currentPP: move.pp,
        };

        team?.pokemon[team.pokemon.indexOf(selectedPokemon?.partyPokemon as IPartyPokemon)].selectedMoves.push(move.partyPokemonMove);

        setTeam(team);
        setShowModal('false');
    }, [team, selectedPokemon]);

    const handleDeleteMove = React.useCallback(() => {
        console.log(`handleDeleteMove`);
        
        const pokemon = team?.pokemon[team.pokemon.indexOf(selectedPokemon?.partyPokemon as IPartyPokemon)];
        pokemon?.selectedMoves.splice(pokemon.selectedMoves.indexOf(pokemon.selectedMoves.find(move => move.moveId === selectedMove?.id) as ISelectedMove), 1);
        //console.log(pokemon?.selectedMoves);

        setTeam(team);
        setShowModal('false');
    }, [team, selectedPokemon, selectedMove]);

    const handleNicknameChange = React.useCallback((pokemon: IPokemon, newNickname: string) => {
        console.log(`handleNicknameChange`);
        //const pre = team?.pokemon[team.pokemon.indexOf(pokemon.partyPokemon as IPartyPokemon)].nickname;
        (team?.pokemon[team?.pokemon.indexOf(pokemon.partyPokemon as IPartyPokemon)] as IPartyPokemon).nickname = newNickname;
        //console.log(`${pre} => ${team?.pokemon[team.pokemon.indexOf(pokemon.partyPokemon as IPartyPokemon)]?.nickname}`);
        setTeam(team);
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
            selectedPokemon,
            selectedMove,

            setTeam,
            setLoadingTeam,
            setShowModal,
            setSelectedPokemon,
            setSelectedMove,

            handleAddPokemon,
            handleDeletePokemon,
            handleAddMove,
            handleDeleteMove,
            handleNicknameChange,
            handleTeamSave,
        }), 
        [
            team, 
            loadingTeam,
            showModal,
            selectedPokemon,
            selectedMove,

            setTeam,
            setLoadingTeam,
            setShowModal,
            setSelectedPokemon,
            setSelectedMove, 

            handleAddPokemon,
            handleDeletePokemon,
            handleAddMove,
            handleDeleteMove,
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