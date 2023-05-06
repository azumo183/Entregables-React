import React from 'react'
import { IAction, IBattle, IPlayer } from '../../models/IBattle'
import { useParams } from 'react-router-dom';
import { getBattleLive, updateBattle } from '../../services/firebase-battles';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { IPartyPokemon, ISelectedMove } from '../../models/IParty';
import { usePokedexContext } from '../../contexts/PokedexContext';
import pokeball from '../../resources/Poké_Ball_icon.svg.png'
import { callApi, formatedMove, status } from '../../util';
import { IMove } from '../../models/IMove';
import { TypeTag } from '../atoms/TypeTag';
import { useFirebaseUsersContext } from '../../contexts/FirebaseUsersContext';
import { LifeBar } from '../atoms/LifeBar';
import { PokemonIcon } from '../atoms/PokemonIcon';
import { SpinnerCustom } from '../atoms/SpinnerCustom';

export const Battle = () => {
    //const [battle, setBattle] = React.useState<IBattle>();
    const battle = React.useRef<IBattle>();
    
    const [actions, setActions] = React.useState<IAction[]>([]);
    const actionsToExec = React.useRef<IAction[]>([]);

    const [loading, setLoading] = React.useState(true);
    const [updatingDB, setUpdatingDB] = React.useState(true);

    const [frontPlayer, setFrontPlayer] = React.useState<IPlayer>();
    const [frontPlayerStatus, setFrontPlayerStatus] = React.useState<number>();
    const [statusOverride, setStatusOverride] = React.useState<string>();

    const [frontPlayerSelectedPokemon, setFrontPlayerSelectedPokemon] = React.useState<IPartyPokemon>();
    const [frontPlayerSelectedPokemonHP, setFrontPlayerSelectedPokemonHP] = React.useState<number>();
    const [frontPlayerSelectedPokemonMoves, setFrontPlayerSelectedPokemonMoves] = React.useState<ISelectedMove[]>([]);

    const [backPlayer, setBackPlayer] = React.useState<IPlayer>();
    const [backPlayerSelectedPokemon, setBackPlayerSelectedPokemon] = React.useState<IPartyPokemon>();

    const [loadingMoves, setLoadingMoves] = React.useState(true);
    const [selectedPokemonMoves, setSelectedPokemonMoves] = React.useState<IMove[]>([]);
    
    const rol = React.useRef('spectator');
    
    const { battleId } = useParams();
    const { authUser } = useFirebaseAuth();
    const { pokedex, getBaseStat } = usePokedexContext();
    const { users } = useFirebaseUsersContext();

    const loadBattle = React.useCallback(async () => {
        if(!authUser || !battleId) return;
        console.log(`Battle: loading battle ...`)
        //battle.current = await getBattle(authUser, battleId);
        await getBattleLive(battleId, battle, setLoading, setActions);
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

    const updateDB = async () => {
        if(rol.current === 'host' && battle.current && authUser) {
            console.log(`Battle: updating db ...`);
            const tempP1 = battle.current.player1 as IPlayer;
            const tempP2 = battle.current.player2 as IPlayer;
            delete tempP1.action;
            delete tempP2.action;
            await updateBattle(battle.current, battle.current, authUser, false);
        };
    };

    const handlePerformAction = async (type: number, option: number, speed: number, data?: Object) => {
        if(!battle.current || !authUser) return;
        if(rol.current === 'host') await updateBattle(battle.current, { player1: { action: { type: type, option: option, speed: speed, data: (data? data: null), owner: authUser.uid } } }, authUser, true);
        else if(rol.current === 'p2') await updateBattle(battle.current, { player2: { action: { type: type, option: option, speed: speed, data: (data? data: null), owner: authUser.uid } } }, authUser, true);
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
        if(battle.current?.status !== 3) setFrontPlayerStatus(0); // if battle is not over continue to next turn
        else setUpdatingDB(false);
    };

    const execActions = async (actions: IAction[], index: number) => {

        if(!battle.current) return;

        const frontPlayer = (battle.current?.player2 as IPlayer).party?.owner === authUser?.uid ? (battle.current?.player2 as IPlayer) : battle.current?.player1;
        const backPlayer = frontPlayer === battle.current?.player1 ? (battle.current?.player2 as IPlayer) : battle.current?.player1;
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
                setBackPlayer(backPlayer);
                setFrontPlayer(frontPlayer);
                
            } else {
                backPlayerSelectedPokemon.selectedMoves[actions[index].option].currentPP--;
                frontPlayerSelectedPokemon.currentHP -= Math.floor((actions[index].data?.movePower as number)/2);
                if(frontPlayerSelectedPokemon.currentHP <= 0) {
                    frontPlayerSelectedPokemon.currentHP = 0;
                    actions[index+1] = {type: 3, option: 0, speed: 0, owner: (frontPlayer?.party?.owner as string)};
                }
                setFrontPlayer(frontPlayer);
            }
        }

        //switch
        else if(actions[index].type === 1){
            const message = `${users.find(user => user.id === actions[index].owner)?.data.displayName} switched for ${ frontPlayer.party?.owner === actions[index].owner ? frontPlayer.party.pokemon[actions[index].option].nickname : backPlayer.party?.pokemon[actions[index].option].nickname}`;
            setStatusOverride(message);
            console.log(message);

            if(frontPlayer.party?.owner === actions[index].owner) {
                frontPlayer.selectedPokemon = actions[index].option;
                setFrontPlayerSelectedPokemon(frontPlayer.party.pokemon[frontPlayer.selectedPokemon]);
            }else{
                backPlayer.selectedPokemon = actions[index].option;
                setBackPlayerSelectedPokemon(backPlayer.party.pokemon[backPlayer.selectedPokemon]);
            }
        }

        //faint
        else if(actions[index].type === 3){
            const message = `${ frontPlayer?.party?.owner === actions[index].owner ? frontPlayerSelectedPokemon?.nickname : `Opponent's ${backPlayerSelectedPokemon?.nickname}` } fainted`;
            setStatusOverride(message);
            console.log(message);

            if(frontPlayer?.party?.owner === actions[index].owner) {
                setFrontPlayer(frontPlayer);
                const nextPokemon = frontPlayer.party.pokemon.find(pokemon => pokemon.currentHP > 0);
                if(nextPokemon) actions[index+1] = {type: 1, option: frontPlayer.party.pokemon.indexOf(nextPokemon), speed: 0, owner: (frontPlayer.party.owner as string)};
                else actions[index+1] = {type: 4, option: 0, speed: 0, owner: (frontPlayer.party.owner as string)};
            }else{
                setBackPlayer(backPlayer);
                const nextPokemon = backPlayer.party.pokemon.find(pokemon => pokemon.currentHP > 0);
                if(nextPokemon) actions[index+1] = {type: 1, option: backPlayer.party.pokemon.indexOf(nextPokemon), speed: 0, owner: (backPlayer.party.owner as string)};
                else actions[index+1] = {type: 4, option: 0, speed: 0, owner: (backPlayer.party.owner as string)};
            }
        }

        //gave up || out of pokemon || timed out (not programmed yet)
        else if(actions[index].type === 2 || actions[index].type === 4){
            const message = actions[index].type === 2 ?
                `${users.find(user => user.id === actions[index].owner)?.data.displayName} gave up ... ${ users.find(user => user.id === (frontPlayer.party?.owner === actions[index].owner ? backPlayer.party?.owner : frontPlayer.party?.owner))?.data.displayName } wins the battle!!`:
                `${users.find(user => user.id === actions[index].owner)?.data.displayName} is out of Pokémon. ${ users.find(user => user.id === (frontPlayer.party?.owner === actions[index].owner ? backPlayer.party?.owner : frontPlayer.party?.owner))?.data.displayName } wins the battle!!`;
            setStatusOverride(message);
            console.log(message);

            battle.current.status = 3;
            if(actions[index].owner === frontPlayer.party.owner){
                frontPlayer.status = actions[index].type === 2 ? 3 : (actions[index].type === 4 ? 1 : 5);
                backPlayer.status = actions[index].type === 2 ? 2 : (actions[index].type === 4 ? 0 : 4);
            }else{
                frontPlayer.status = actions[index].type === 2 ? 3 : (actions[index].type === 4 ? 1 : 5);
                backPlayer.status = actions[index].type === 2 ? 2 : (actions[index].type === 4 ? 0 : 4);
            }

            actions[index+1] = {type: 5, option: 0, speed: 0, owner: (actions[index].owner)};
        }

        //console.log(battle.current);

        if(index+1 < actions.length && actions[index].type !== 5) setTimeout(() => execActions(actions, index+1), 3000);
        else {
            if(battle.current.status !== 3) setFrontPlayerStatus(2);
            if(rol.current === 'host') await updateDB();
            waitActionsReset();
        }
    };

    React.useEffect(() => {
        loadBattle();
    }, [loadBattle]);

    React.useEffect(() => {
        if(actions.filter(action => action).length === 2){
            const p2First = false; //Math.floor(Math.random() * 2) === 1;
            actionsToExec.current = actions[1].speed > actions[0].speed || (actions[0].speed === actions[1].speed && p2First)?
                [actions[1], actions[0]]: [...actions];
            console.log(`Battle: actionsToExec set to ${actionsToExec}`);
        }
        else actionsToExec.current = [];
    }, [actions]);

    React.useEffect(() => {
        if(!authUser || !battle.current) return;
        if(!loading) {
            console.log(`Battle: defining sides ...`);
            if(battle.current.player1.party?.owner === authUser.uid) rol.current = 'host';

            if((battle.current.player2 as IPlayer).party?.owner === authUser.uid){
                rol.current = 'p2';
                setFrontPlayer((battle.current.player2 as IPlayer));
                setBackPlayer(battle.current.player1);
            }else{
                setFrontPlayer(battle.current.player1);
                setBackPlayer((battle.current.player2 as IPlayer));
            }
        }
    }, [authUser, loading]);

    React.useEffect(() => {
        if(frontPlayer) {
            console.log(`Battle: setting front side first pokemon ...`);
            setFrontPlayerStatus(frontPlayer.action? 1 : 0);
            setFrontPlayerSelectedPokemon(frontPlayer.party?.pokemon[frontPlayer.selectedPokemon]);
        }
    }, [frontPlayer]);

    React.useEffect(() => {
        //console.log(`battle: ${battle}\nfrontPlayerStatus: ${frontPlayerStatus}`);
        if(battle.current && frontPlayerStatus !== undefined) setStatusOverride(`${status[battle.current.status][frontPlayerStatus]}`);
    }, [battle, frontPlayerStatus]);

    React.useEffect(() => {
        if(backPlayer) {
            console.log(`Battle: setting back side first pokemon ...`)
            setBackPlayerSelectedPokemon(backPlayer.party?.pokemon[backPlayer.selectedPokemon]);
        }
    }, [backPlayer]);

    React.useEffect(() => {
        if(frontPlayerSelectedPokemon) {
            setFrontPlayerSelectedPokemonHP(frontPlayerSelectedPokemon.currentHP);
            setFrontPlayerSelectedPokemonMoves(frontPlayerSelectedPokemon.selectedMoves);
            loadMoves(frontPlayerSelectedPokemon);
        }
    }, [frontPlayerSelectedPokemon, loadMoves]);

    if(loading) return <SpinnerCustom/>
    
    if(!battle.current || !backPlayer || !backPlayerSelectedPokemon || !frontPlayer || frontPlayerStatus === undefined || !frontPlayerSelectedPokemon || frontPlayerSelectedPokemonHP === undefined) {
        return (
            <>
                <p>Wooops! Something went wrong ...</p>
                <ul>
                    <li>{`battle.current: ${battle.current}`}</li>
                    <li>{`backPlayer: ${backPlayer}`}</li>
                    <li>{`backPlayerSelectedPokemon: ${backPlayerSelectedPokemon}`}</li>
                    <li>{`frontPlayer: ${frontPlayer}`}</li>
                    <li>{`frontPlayerStatus: ${frontPlayerStatus}`}</li>
                    <li>{`frontPlayerSelectedPokemon: ${frontPlayerSelectedPokemon}`}</li>
                    <li>{`frontPlayerSelectedPokemonHP: ${frontPlayerSelectedPokemonHP}`}</li>
                </ul>
            </>
        )
    }

    const sprites = {
        front: pokedex[backPlayerSelectedPokemon.pokemonId-1].sprites.versions['generation-v']['black-white'].animated.front_default,
        back: pokedex[frontPlayerSelectedPokemon.pokemonId-1].sprites.versions['generation-v']['black-white'].animated.back_default,
    };

    return (
        <>
            <h1>Pokémon Battle <span style={{fontSize: 'small'}}>{`ID: ${battle.current.id}`}</span></h1>
            <hr/>
            <Row>
                <Col xs={8} className='textAlignRight'>
                    <img className='sprite' src={sprites.front? sprites.front: ""} alt={`${backPlayerSelectedPokemon.nickname}'s front`} />
                </Col>
                <Col xs={4}>
                    <Card>
                        <Card.Header>
                            <div style={{float: 'right'}}>
                                {backPlayer.party?.pokemon.map((pokemon, index) => <img key={index} src={pokeball} alt='Pokéball' style={{height: '16px', filter: `grayscale(${pokemon.currentHP > 0? 0: 1})`}}/>)}
                            </div>
                            <small>{`${users.find(user => user.id === backPlayer.party?.owner)?.data.displayName}'s`}</small>
                            <br/>
                            {backPlayerSelectedPokemon.nickname} <small>#{backPlayerSelectedPokemon.pokemonId}</small>
                        </Card.Header>
                        <Card.Body>
                            <LifeBar pokemon={backPlayerSelectedPokemon}/>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col xs={4}>
                    <Card>
                        <Card.Header>
                            <div style={{float: 'right'}}>
                                {frontPlayer.party?.pokemon.map((pokemon, index) => <img key={index} src={pokeball} alt='Pokéball' style={{height: '16px', filter: `grayscale(${pokemon.currentHP > 0? 0: 1})`}}/>)}
                            </div>
                            <small>{`${users.find(user => user.id === frontPlayer.party?.owner)?.data.displayName}'s`}</small>
                            <br/>
                            {frontPlayerSelectedPokemon.nickname} <small>#{frontPlayerSelectedPokemon.pokemonId}</small>
                        </Card.Header>
                        <Card.Body>
                            <LifeBar pokemon={frontPlayerSelectedPokemon}/>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={4}>
                    <img className='sprite' src={sprites.back? sprites.back: ""} alt={`${frontPlayerSelectedPokemon.nickname}'s front`} />
                </Col>
            </Row>
            <Row style={{backgroundColor: 'lavender', padding: '20px 0px', margin: '16px 0px 24px 0px', borderRadius: '6px'}}>
                <Col><p className='noMargin smallText'>{`Status: ${statusOverride}`}</p></Col>
            </Row>
            <Row>
                <Col className='textAlignCenter'>
                    {battle.current.status <= 2?
                        <>
                            <p>{`What will ${frontPlayerSelectedPokemon.nickname} do?`}</p>
                            {loadingMoves ? <p>Loading</p>:
                            frontPlayerSelectedPokemonMoves.map((move, index) => (
                                <Button key={move.moveId} className='battleMove' size='sm' disabled={frontPlayerStatus !== 0 || move.currentPP < 1} variant='outline-dark' onClick={() => handlePerformAction(0, index, getBaseStat(frontPlayerSelectedPokemon.pokemonId, 'speed'), { moveName: selectedPokemonMoves[index].name, movePower: selectedPokemonMoves[index].power })} style={{padding: '11px 8px'}}>
                                    <p>{formatedMove(selectedPokemonMoves[index].name)} <TypeTag typeName={selectedPokemonMoves[index].type.name}/></p>
                                    <p>{`PP: ${move.currentPP}`}</p>
                                </Button>
                            ))}

                            <p style={{marginTop: '16px'}}>Or you can switch to:</p>
                            {frontPlayer.party?.pokemon.map((pokemon, index) =>
                                <Button key={index} className='battleMove' size='sm' variant='outline-dark' disabled={frontPlayerStatus !== 0 || pokemon.currentHP === 0 || pokemon === frontPlayerSelectedPokemon} onClick={() => handlePerformAction(1, index, 1000)} style={pokemon === frontPlayerSelectedPokemon? {boxShadow: '0 0 0 0.25rem #20b2ab80'}: {}}>
                                    <p><PokemonIcon pokemonId={pokemon.pokemonId} style={{filter: `grayscale(${pokemon.currentHP > 0? 0 : 1})`}}/><span style={{position: 'relative', bottom: '6px'}}>{pokemon.nickname}</span></p>
                                    <LifeBar pokemon={pokemon} style={{margin: '2.5px 0px'}}/>
                                </Button>
                            )}

                            <hr/>

                            <Button className='battleMove' size='sm' variant='outline-danger' disabled={frontPlayerStatus !== 0} onClick={() => handlePerformAction(2, 1, 1001)} style={{float: 'right'}}>Give Up</Button>
                        </>:
                        <>
                            {updatingDB?
                                <p>Saving changes ...</p>:
                                <a href='/'>Back to Battle Hub</a>
                            }
                        </>
                    }
                </Col>
            </Row>
        </>
    )
}
