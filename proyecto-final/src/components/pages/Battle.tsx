import React from 'react'
import { IAction, IActionData, IBattle, IPlayer } from '../../models/IBattle'
import { useParams } from 'react-router-dom';
import { getBattleLive, updateBattle } from '../../services/firebase-battles';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { Button, Col, Row } from 'react-bootstrap';
import { IParty, IPartyPokemon, ISelectedMove } from '../../models/IParty';
import { callApi, formatedMove, status } from '../../util';
import { useFirebaseUsersContext } from '../../contexts/FirebaseUsersContext';
import { LifeBar } from '../atoms/LifeBar';
import { PokemonIcon } from '../atoms/PokemonIcon';
import { SpinnerCustom } from '../atoms/SpinnerCustom';
import { BattleSide } from '../molecules/BattleSide';
import { usePokedexContext } from '../../contexts/PokedexContext';
import { IMove } from '../../models/IMove';
import { TypeTag } from '../atoms/TypeTag';

export const Battle = () => {
    const [battle, setBattle] = React.useState<IBattle>();
    const [loading, setLoading] = React.useState(true);
    const [updatingDB, setUpdatingDB] = React.useState(true);

    const [backPlayer, setBackPlayer] = React.useState<IPlayer>();
    const [frontPlayer, setFrontPlayer] = React.useState<IPlayer>();
    
    const [loadingMoves, setLoadingMoves] = React.useState(true);
    const [selectedPokemonMoves, setSelectedPokemonMoves] = React.useState<IMove[]>([]);

    const [statusOverride, setStatusOverride] = React.useState<string>();
    
    const rol = React.useRef('spectator');
    const actionsToExec = React.useRef<IAction[]>([]);
    const selectedPokemon = React.useRef(-1);
    
    const { battleId } = useParams();
    const { authUser } = useFirebaseAuth();
    const { getUserDisplayName } = useFirebaseUsersContext();
    const { getBaseStat } = usePokedexContext();

    const loadBattle = React.useCallback(async () => {
        if(!authUser || !battleId) return;
        console.log(`Battle: loading battle ...`);
        await getBattleLive(battleId, setBattle, setLoading);
    }, [authUser, battleId]);

    const loadMoves = React.useCallback(async (pokemon: IPartyPokemon) => {
        console.log(`Battle: loading ${pokemon.nickname} moves ...`)
        setLoadingMoves(true);
        const response = await callApi(pokemon.selectedMoves.map(move => `https://pokeapi.co/api/v2/move/${move.moveId}`));
        const moves: IMove[] = [];
        response.forEach(element => moves.push(element.data as IMove));
        setSelectedPokemonMoves(moves);
        setLoadingMoves(false);
    }, []);

    const setFrontPlayerStatus = (status: number) => {
        if(!battle) return;
        if(rol.current === 'host') setBattle({...battle, player1: {...battle.player1, status: status}});
        if(rol.current === 'p2') setBattle({...battle, player2: {...battle.player2 as IPlayer, status: status}});
    };

    const updateDB = async () => {
        if(rol.current === 'host' && battle && authUser) {
            console.log(`Battle: updating db ...`);
            const tempP1 = battle.player1 as IPlayer;
            const tempP2 = battle.player2 as IPlayer;
            delete tempP1.action;
            delete tempP2.action;
            await updateBattle(battle, battle, authUser, false);
        };
    };

    const handlePerformAction = async (type: number, option: number, speed: number, data?: IActionData) => {
        if(!battle || !authUser) return;
        if(rol.current === 'host') await updateBattle(battle, { player1: { action: { type: type, option: option, speed: speed, data: (data? data: null), owner: authUser.uid } } }, authUser, true);
        else if(rol.current === 'p2') await updateBattle(battle, { player2: { action: { type: type, option: option, speed: speed, data: (data? data: null), owner: authUser.uid } } }, authUser, true);
        setFrontPlayerStatus(1);
        getActions();
    };

    const getActions = () => {
        if(actionsToExec.current.length < 2){
            console.log(`waiting for player actions ...`)
            setTimeout(getActions, 2000);
            return;
        }
        execActions(actionsToExec.current, 0);
    };

    const waitActionsReset = () => {
        if(rol.current === 'p2' && actionsToExec.current.length === 2){
            console.log(`waiting for player actions ...`)
            setTimeout(waitActionsReset, 2000);
            return;
        }
        if(battle?.status !== 3) setFrontPlayerStatus(0); // if battle is not over continue to next turn
        else setUpdatingDB(false);
    };

    const execActions = async (actions: IAction[], index: number) => {

        if(!battle) return;

        const frontPlayer = (battle?.player2 as IPlayer).party?.owner === authUser?.uid ? (battle?.player2 as IPlayer) : battle?.player1;
        const backPlayer = frontPlayer === battle?.player1 ? (battle?.player2 as IPlayer) : battle?.player1;
        if(!frontPlayer || !backPlayer) return;

        const frontPlayerSelectedPokemon = frontPlayer.party?.pokemon[frontPlayer.selectedPokemon];
        const backPlayerSelectedPokemon = backPlayer.party?.pokemon[backPlayer.selectedPokemon];
        if(!frontPlayer.party || !frontPlayerSelectedPokemon || !backPlayer.party || !backPlayerSelectedPokemon) return;

        //attack
        if(actions[index].type === 0){
            const message = `${ frontPlayer.party?.owner === actions[index].owner ? frontPlayerSelectedPokemon.nickname : `Opponent's ${backPlayerSelectedPokemon.nickname}` } used ${ formatedMove(actions[index].data?.moveName as string) }`;
            setStatusOverride(message);
            console.log(message);

            if(frontPlayer?.party?.owner === actions[index].owner) {
                frontPlayerSelectedPokemon.selectedMoves[actions[index].option].currentPP--;
                backPlayerSelectedPokemon.currentHP -= Math.floor((actions[index].data?.movePower as number)/2);
                if(backPlayerSelectedPokemon.currentHP <= 0){
                    backPlayerSelectedPokemon.currentHP = 0;
                    actions[index+1] = {type: 3, option: 0, speed: 0, owner: (backPlayer?.party?.owner as string)};
                }
                
            } else {
                backPlayerSelectedPokemon.selectedMoves[actions[index].option].currentPP--;
                frontPlayerSelectedPokemon.currentHP -= Math.floor((actions[index].data?.movePower as number)/2);
                if(frontPlayerSelectedPokemon.currentHP <= 0) {
                    frontPlayerSelectedPokemon.currentHP = 0;
                    actions[index+1] = {type: 3, option: 0, speed: 0, owner: (frontPlayer?.party?.owner as string)};
                }
            }
        }

        //switch
        else if(actions[index].type === 1){
            const message = `${getUserDisplayName(actions[index].owner)} switched for ${ frontPlayer.party?.owner === actions[index].owner ? frontPlayer.party.pokemon[actions[index].option].nickname : backPlayer.party?.pokemon[actions[index].option].nickname}`;
            setStatusOverride(message);
            console.log(message);

            if(frontPlayer.party?.owner === actions[index].owner) frontPlayer.selectedPokemon = actions[index].option;
            else backPlayer.selectedPokemon = actions[index].option;
        }

        //faint
        else if(actions[index].type === 3){
            const message = `${ frontPlayer?.party?.owner === actions[index].owner ? frontPlayerSelectedPokemon?.nickname : `Opponent's ${backPlayerSelectedPokemon?.nickname}` } fainted`;
            setStatusOverride(message);
            console.log(message);

            if(frontPlayer?.party?.owner === actions[index].owner) {
                const nextPokemon = frontPlayer.party.pokemon.find(pokemon => pokemon.currentHP > 0);
                if(nextPokemon) actions[index+1] = {type: 1, option: frontPlayer.party.pokemon.indexOf(nextPokemon), speed: 0, owner: (frontPlayer.party.owner as string)};
                else actions[index+1] = {type: 4, option: 0, speed: 0, owner: (frontPlayer.party.owner as string)};
            }else{
                const nextPokemon = backPlayer.party.pokemon.find(pokemon => pokemon.currentHP > 0);
                if(nextPokemon) actions[index+1] = {type: 1, option: backPlayer.party.pokemon.indexOf(nextPokemon), speed: 0, owner: (backPlayer.party.owner as string)};
                else actions[index+1] = {type: 4, option: 0, speed: 0, owner: (backPlayer.party.owner as string)};
            }
        }

        //gave up || out of pokemon || timed out (not programmed yet)
        else if(actions[index].type === 2 || actions[index].type === 4){
            const message = actions[index].type === 2 ?
                `${getUserDisplayName(actions[index].owner)} gave up ... ${getUserDisplayName(frontPlayer.party?.owner === actions[index].owner ? backPlayer.party?.owner : frontPlayer.party?.owner)} wins the battle!!`:
                `${getUserDisplayName(actions[index].owner)} is out of Pokémon. ${getUserDisplayName(frontPlayer.party?.owner === actions[index].owner ? backPlayer.party?.owner : frontPlayer.party?.owner)} wins the battle!!`;
            setStatusOverride(message);
            console.log(message);

            battle.status = 3;
            if(actions[index].owner === frontPlayer.party.owner){
                frontPlayer.status = actions[index].type === 2 ? 3 : (actions[index].type === 4 ? 1 : 5);
                backPlayer.status = actions[index].type === 2 ? 2 : (actions[index].type === 4 ? 0 : 4);
            }else{
                frontPlayer.status = actions[index].type === 2 ? 2 : (actions[index].type === 4 ? 0 : 4);
                backPlayer.status = actions[index].type === 2 ? 3 : (actions[index].type === 4 ? 1 : 5);
            }

            actions[index+1] = {type: 5, option: 0, speed: 0, owner: (actions[index].owner)};
        }

        setBattle({...battle});
        //console.log(battle);

        if(index+1 < actions.length && actions[index].type !== 5) setTimeout(() => execActions(actions, index+1), 3000);
        else {
            if(battle.status !== 3) setFrontPlayerStatus(2);
            if(rol.current === 'host') await updateDB();
            waitActionsReset();
        }
    };

    React.useEffect(() => {
        loadBattle();
    }, [loadBattle]);

    React.useEffect(() => {
        if(!authUser || !battle) return;
        console.log(`Battle: defining sides ...`);
        if(battle.player1.party?.owner === authUser.uid) rol.current = 'host';

        if((battle.player2 as IPlayer).party?.owner === authUser.uid){
            rol.current = 'p2';
            setFrontPlayer((battle.player2 as IPlayer));
            setBackPlayer(battle.player1);
        }else{
            setFrontPlayer(battle.player1);
            setBackPlayer((battle.player2 as IPlayer));
        }

        const actions = [battle.player1.action as IAction, (battle.player2 as IPlayer).action as IAction];
        if(actions.filter(action => action).length === 2){
            actionsToExec.current = actions[1].speed > actions[0].speed || (actions[0].speed === actions[1].speed && actions[1].data?.p2GoesFirst)?
                [actions[1], actions[0]]: [...actions];
            console.log(`Battle: actionsToExec set ...`);
        }
        else actionsToExec.current = [];
    }, [authUser, battle]);

    React.useEffect(() => {
        if(battle?.status !== undefined && frontPlayer?.status !== undefined){
            //console.log(`battle.status: ${battle?.status}\nfrontPlayer.status: ${frontPlayer?.status}`);
            setStatusOverride(`${status[battle.status][frontPlayer?.status]}`);
        } 
    }, [battle?.status, frontPlayer?.status]);

    React.useEffect(() => {
        if(frontPlayer?.selectedPokemon !== undefined && selectedPokemon.current !== frontPlayer.selectedPokemon){
            loadMoves(frontPlayer.party?.pokemon[frontPlayer.selectedPokemon] as IPartyPokemon);
            selectedPokemon.current = frontPlayer.selectedPokemon;
        }
    }, [frontPlayer?.selectedPokemon, frontPlayer?.party?.pokemon, loadMoves]);

    if(loading) return <SpinnerCustom/>
    
    if(!battle || !frontPlayer || !backPlayer) return <p>Wooops! Something went wrong ...</p>

    return (
        <>
            <h1>Pokémon Battle <span style={{fontSize: 'small'}}>{`ID: ${battle.id}`}</span></h1>
            <hr/>

            <BattleSide player={backPlayer} front={false} />
            <BattleSide player={frontPlayer} front={true} />
            
            <Row style={{backgroundColor: 'lavender', padding: '20px 0px', margin: '16px 0px 24px 0px', borderRadius: '6px'}}>
                <Col><p className='noMargin smallText'>{`Status: ${statusOverride}`}</p></Col>
            </Row>

            <Row className='textAlignCenter'>
                {battle.status <= 2?
                    <>
                        <Col sm={12} style={{minHeight: '176px'}}>
                            <p>{`What will ${frontPlayer.party?.pokemon[frontPlayer.selectedPokemon].nickname} do?`}</p>
                            {loadingMoves ? <SpinnerCustom/> :
                                <>
                                    {selectedPokemonMoves.map((move, index) => (
                                        <Button key={move.id} className='battleMove' size='sm' disabled={frontPlayer.status !== 0 || ((frontPlayer.party?.pokemon[frontPlayer.selectedPokemon] as IPartyPokemon).selectedMoves[index] as ISelectedMove).currentPP < 1} variant='outline-dark' onClick={() => handlePerformAction(0, index, getBaseStat((frontPlayer.party?.pokemon[frontPlayer.selectedPokemon] as IPartyPokemon).pokemonId, 'speed'), { moveName: move.name, movePower: move.power, p2GoesFirst: (Math.floor(Math.random() * 2) === 1) })} style={{padding: '11px 8px'}}>
                                            <p>{formatedMove(move.name)} <TypeTag typeName={move.type.name}/></p>
                                            <p>{`PP: ${((frontPlayer.party?.pokemon[frontPlayer.selectedPokemon] as IPartyPokemon).selectedMoves[index] as ISelectedMove).currentPP}`}</p>
                                        </Button>
                                    ))}
                                </>
                            }
                        </Col>

                        <Col sm={12} style={{minHeight: '176px'}}>
                            <p style={{}}>Or you can switch to:</p>
                            {frontPlayer.party?.pokemon.map((pokemon, index) =>
                                <Button key={index} className='battleMove' size='sm' variant='outline-dark' disabled={frontPlayer.status !== 0 || pokemon.currentHP === 0 || pokemon === (frontPlayer.party as IParty).pokemon[frontPlayer.selectedPokemon]} onClick={() => handlePerformAction(1, index, 1000)} style={pokemon === (frontPlayer.party as IParty).pokemon[frontPlayer.selectedPokemon]? {boxShadow: '0 0 0 0.25rem #20b2ab80'}: {}}>
                                    <p><PokemonIcon pokemonId={pokemon.pokemonId} style={{filter: `grayscale(${pokemon.currentHP > 0? 0 : 1})`}}/><span style={{position: 'relative', bottom: '6px'}}>{pokemon.nickname}</span></p>
                                    <LifeBar pokemon={pokemon} style={{margin: '2.5px 0px'}}/>
                                </Button>
                            )}
                        </Col>
                        
                        <Col sm={12}>
                            <hr/>
                            <Button className='battleMove' size='sm' variant='outline-danger' disabled={frontPlayer.status !== 0} onClick={() => handlePerformAction(2, 1, 1001)} style={{float: 'right'}}>Give Up</Button>
                        </Col>
                    </>:
                    <Col sm={12}>
                        {updatingDB?
                            <p><SpinnerCustom as='span'/> Saving changes ...</p>:
                            <a href='/battle'>Back to Battle Hub</a>
                        }
                    </Col>
                }
            </Row>
        </>
    )
}
