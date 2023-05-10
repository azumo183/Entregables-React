import React from 'react'
import { TeamsList } from './TeamsList'
import { IParty } from '../../models/IParty';
import { IBattle, IPlayer } from '../../models/IBattle';
import { Button } from 'react-bootstrap';
import { usePokedexContext } from '../../contexts/PokedexContext';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { createRandomTeam, encode } from '../../util';
import { AiBattle } from '../organisms/AiBattle';

const defaultBattle: IBattle = {
    id: encode('ai-battle'),
    date: 0,
    player1: {
        party: undefined,
        status: 0,
        selectedPokemon: 0,
    },
    player2: {
        party: undefined,
        status: 0,
        selectedPokemon: 0,
    },
    status: 2,
    config: {
        blind: true,
        timed: false,
    },
};

export const AiBattleSetup = () => {
    const [step, setStep] = React.useState(0);
    const battle = React.useRef(defaultBattle);

    const {pokedex} = usePokedexContext();
    const {authUser} = useFirebaseAuth();

    const handleTeamSelect = (team: IParty | undefined) => {
        battle.current.player1.party = team;
    };

    const handleBattleStart = async () => {
        if(!battle.current.player1.party){
            battle.current.player1.party = await createRandomTeam(authUser? authUser: 'guest', pokedex);
        }
        (battle.current.player2 as IPlayer).party = await createRandomTeam('-bot-', pokedex);
        setStep(1);
    };

    if(step === 0) return (
        <>
            <h1>AI Battle Setup</h1>
            <TeamsList variant='select' style={{marginBottom: '10px'}} handleTeamSelect={handleTeamSelect}/>
            <Button style={{width: '120px', float: 'right'}} onClick={handleBattleStart}>Next</Button>
        </>
    )

    else if(step === 1) return <AiBattle battleProp={battle.current}/>

    return <p>Wooops! Something went wrong ...</p>
}
