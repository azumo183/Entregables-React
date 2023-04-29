import React from 'react'
import { IAction, IBattle, IPlayer } from '../../models/IBattle'
import { useParams } from 'react-router-dom';
import { getBattle, getBattleActions, updateBattle } from '../../services/firebase';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { Button, Card, Col, ProgressBar, Row } from 'react-bootstrap';
import { IPartyPokemon, ISelectedMove } from '../../models/IParty';
import { usePokedexContext } from '../../contexts/PokedexContext';
import pokeball from '../../resources/Poké_Ball_icon.svg.png'
import { formatedMove, status } from '../../util';
import axios from 'axios';
import { IMove } from '../../models/IMove';
import { TypeTag } from '../atoms/TypeTag';

export const Battle = () => {
    //const [battle, setBattle] = React.useState<IBattle>();
    const battle = React.useRef<IBattle>();

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
    const { pokedex } = usePokedexContext();

    const loadBattle = React.useCallback(async () => {
        if(!authUser || !battleId) return;
        console.log(`Battle: loading battle ...`)
        //(await getBattle(authUser, battleId));
        battle.current = await getBattle(authUser, battleId);
        setLoading(false);
    }, [authUser, battleId]);

    const loadMoves = React.useCallback(async (pokemon: IPartyPokemon) => {
        console.log(`Battle: loading ${pokemon.nickname} moves ...`)
        setLoadingMoves(true);
        const calls: any[] = [];
        pokemon.selectedMoves.forEach(move => calls.push(axios.get(`https://pokeapi.co/api/v2/move/${move.moveId}`)));
        const fullMoveData = await Promise.all(calls);
        
        const moves: IMove[] = [];
        fullMoveData.forEach(element => moves.push(element.data as IMove));
        setSelectedPokemonMoves(moves);
        setLoadingMoves(false);
    }, []);

    const updateWholeDB = async () => {
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

    const getActions = async () => {
        if(!battle.current) return;

        let actions = await getBattleActions(battle.current);

        if(actions.length < 2){
            console.log(`not there yet`)
            setTimeout(getActions, 3000);
            return;
        }

        //sort by speed
        let p2First = false;
        if(actions[0].speed === actions[1].speed && Math.floor(Math.random() * 2) === 1) p2First = true;
        if(p2First || actions[0].speed < actions[1].speed) actions = [actions[1], actions[0]];

        execActions(actions, 0);
    };

    const getNoActions = async () => {
        if(!battle.current) return;

        let actions = await getBattleActions(battle.current);

        if(actions.length > 1){
            console.log(`not there yet`)
            setTimeout(getNoActions, 3000);
            return;
        }

        if(battle.current?.status !== 3) setFrontPlayerStatus(0);
        else setUpdatingDB(false);
    };

    const execActions = async (actions: IAction[], index: number) => {
        //attack
        if(actions[index].type === 0){
            const message = `${ frontPlayer?.party?.owner === actions[index].owner ? frontPlayerSelectedPokemon?.nickname : `Opponent's ${backPlayerSelectedPokemon?.nickname}` } used ${ formatedMove(actions[index].data?.moveName as string) }`;
            setStatusOverride(message);

            let hp;

            if(frontPlayer?.party?.owner === actions[index].owner) {
                if(!backPlayerSelectedPokemon) return;
                hp = backPlayerSelectedPokemon?.currentHP - Math.floor((actions[index].data?.movePower as number)/2);
                if(hp < 0) hp = 0;
                setBackPlayerSelectedPokemon({...backPlayerSelectedPokemon, currentHP: (hp)});                
                if(hp === 0) actions[index+1] = {type: 3, option: 0, speed: 0, owner: (backPlayer?.party?.owner as string)};
                
                // const ppUpdate = frontPlayerSelectedPokemonMoves;
                // ppUpdate[actions[index].option].currentPP = ppUpdate[actions[index].option].currentPP - 1;
                // setFrontPlayerSelectedPokemonMoves(ppUpdate);
                
            } else {
                if(!frontPlayerSelectedPokemonHP) return;
                hp = frontPlayerSelectedPokemonHP - Math.floor((actions[index].data?.movePower as number)/2);
                if(hp < 0) hp = 0;
                setFrontPlayerSelectedPokemonHP(hp);
                if(hp === 0) actions[index+1] = {type: 3, option: 0, speed: 0, owner: (frontPlayer?.party?.owner as string)};
            }

            const tempP1 = battle.current?.player1 as IPlayer;
            const tempP2 = battle.current?.player2 as IPlayer;
            if(tempP1.party && tempP2.party)
                if(actions[index].owner === tempP1.party.owner){
                    tempP2.party.pokemon[tempP2.selectedPokemon].currentHP = hp;
                    tempP1.party.pokemon[tempP1.selectedPokemon].selectedMoves[actions[index].option].currentPP--;
                }else{
                    tempP1.party.pokemon[tempP1.selectedPokemon].currentHP = hp;
                    tempP2.party.pokemon[tempP2.selectedPokemon].selectedMoves[actions[index].option].currentPP--;
                }
            //console.log(battle.current);
        }

        //switch
        else if(actions[index].type === 1){
            const message = `${actions[index].owner} switched for ${ frontPlayer?.party?.owner === actions[index].owner ? frontPlayer.party.pokemon[actions[index].option].nickname : backPlayer?.party?.pokemon[actions[index].option].nickname}`;
            setStatusOverride(message);

            if(frontPlayer?.party?.owner === actions[index].owner) {
                setFrontPlayerSelectedPokemon(frontPlayer.party.pokemon[actions[index].option]);
            }else{
                setBackPlayerSelectedPokemon(backPlayer?.party?.pokemon[actions[index].option]);
            }

            const tempP1 = battle.current?.player1 as IPlayer;
            const tempP2 = battle.current?.player2 as IPlayer;
            if(tempP1.party && tempP2.party)
                if(actions[index].owner === tempP1.party.owner){
                    tempP1.selectedPokemon = actions[index].option;
                }else{
                    tempP2.selectedPokemon = actions[index].option;
                }
            //console.log(battle.current);
        }

        //faint
        else if(actions[index].type === 3){
            const message = `${ frontPlayer?.party?.owner === actions[index].owner ? frontPlayerSelectedPokemon?.nickname : `Opponent's ${backPlayerSelectedPokemon?.nickname}` } fainted`;
            setStatusOverride(message);

            if(frontPlayer?.party?.owner === actions[index].owner) {
                const nextPokemon = frontPlayer.party.pokemon.find(pokemon => pokemon.currentHP > 0);
                if(nextPokemon) actions[index+1] = {type: 1, option: frontPlayer.party.pokemon.indexOf(nextPokemon), speed: 0, owner: (frontPlayer.party.owner as string)};
                else actions[index+1] = {type: 4, option: 0, speed: 0, owner: (frontPlayer.party.owner as string)};
            }else{
                if(!backPlayer || !backPlayer.party) return;
                const nextPokemon = backPlayer.party.pokemon.find(pokemon => pokemon.currentHP > 0);
                if(nextPokemon) actions[index+1] = {type: 1, option: backPlayer.party.pokemon.indexOf(nextPokemon), speed: 0, owner: (backPlayer.party.owner as string)};
                else actions[index+1] = {type: 4, option: 0, speed: 0, owner: (backPlayer.party.owner as string)};
            }
        }

        //gave up || out of pokemon || timed out (not programmed yet)
        else if(actions[index].type === 2 || actions[index].type === 4){
            const message = actions[index].type === 2 ?
                `${actions[index].owner} gave up ... ${ frontPlayer?.party?.owner === actions[index].owner ? backPlayer?.party?.owner : frontPlayer?.party?.owner } wins the battle!!`:
                `${actions[index].owner} is out of Pokémon. ${ frontPlayer?.party?.owner === actions[index].owner ? backPlayer?.party?.owner : frontPlayer?.party?.owner } wins the battle!!`;
            setStatusOverride(message);

            if(battle.current) battle.current.status = 3;
            const tempP1 = battle.current?.player1 as IPlayer;
            const tempP2 = battle.current?.player2 as IPlayer;
            if(tempP1.party && tempP2.party)
                if(actions[index].owner === tempP1.party.owner){
                    tempP1.status = actions[index].type === 2 ? 3 : (actions[index].type === 4 ? 1 : 5);
                    tempP2.status = actions[index].type === 2 ? 2 : (actions[index].type === 4 ? 0 : 4);
                }else{
                    tempP2.status = actions[index].type === 2 ? 3 : (actions[index].type === 4 ? 1 : 5);
                    tempP1.status = actions[index].type === 2 ? 2 : (actions[index].type === 4 ? 0 : 4);
                }
            //console.log(battle.current);

            actions[index+1] = {type: 5, option: 0, speed: 0, owner: (actions[index].owner)};
        }

        if(index+1 < actions.length && actions[index].type !== 5) setTimeout(() => execActions(actions, index+1), 3000);
        else {
            if(battle.current?.status !== 3) setFrontPlayerStatus(2);
            if(rol.current === 'host'){
                await updateWholeDB();
                if(battle.current?.status !== 3) setFrontPlayerStatus(0);
                else setUpdatingDB(false);
            }
            else if(rol.current === 'p2'){
                getNoActions();
            }
        }
    };

    React.useEffect(() => {
        loadBattle();
    }, [loadBattle]);

    React.useEffect(() => {
        if(!authUser) return;
        if(loading === false && battle.current) {
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

    if(loading) return <p>Loading ...</p>
    
    if(!battle.current || !backPlayer || !backPlayerSelectedPokemon || !frontPlayer || frontPlayerStatus === undefined || !frontPlayerSelectedPokemon || frontPlayerSelectedPokemonHP === undefined) {
        const log = `battle.current: ${battle.current}\nbackPlayer: ${backPlayer}\nbackPlayerSelectedPokemon: ${backPlayerSelectedPokemon}\nfrontPlayer: ${frontPlayer}\nfrontPlayerStatus: ${frontPlayerStatus}\nfrontPlayerSelectedPokemon: ${frontPlayerSelectedPokemon}\n frontPlayerSelectedPokemonHP: ${frontPlayerSelectedPokemonHP}`;
        return <p>{`Wooops! Something went wrong ...\n\n${log}`}</p>
    }

    const sprites = {
        front: pokedex[backPlayerSelectedPokemon.pokemonId-1].sprites.versions['generation-v']['black-white'].animated.front_default,
        back: pokedex[frontPlayerSelectedPokemon.pokemonId-1].sprites.versions['generation-v']['black-white'].animated.back_default,
    };

    const calcHP = (pokemonId: number, pokemonCurrentHP: number) => {
        let totalHP = pokedex[pokemonId-1].stats.find((stat) => stat.stat.name === 'hp')?.base_stat;
        if(!totalHP) totalHP = pokemonCurrentHP;
        return Math.floor(pokemonCurrentHP * 100 / totalHP);
    };

    const getSpeed = (pokemon: IPartyPokemon) => {
        let speed = pokedex[pokemon.pokemonId-1].stats.find((stat) => stat.stat.name === 'speed')?.base_stat;
        return speed ? speed : 0;
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
                                {backPlayer.party?.pokemon.map((pokemon, index) => {
                                    if(pokemon.currentHP > 0) return <img key={index} src={pokeball} alt='Pokéball' style={{height: '16px'}}/>
                                    else return <img key={index} src={pokeball} alt='Pokéball' style={{height: '16px', filter: 'grayscale(1)'}}/>
                                })}
                            </div>
                            <small>{backPlayer.party?.owner} 's</small>
                            <br/>
                            {backPlayerSelectedPokemon.nickname} <small>#{backPlayerSelectedPokemon.pokemonId}</small>
                        </Card.Header>
                        <Card.Body>
                            <ProgressBar now={calcHP(backPlayerSelectedPokemon.pokemonId, backPlayerSelectedPokemon.currentHP)} label={`${calcHP(backPlayerSelectedPokemon.pokemonId, backPlayerSelectedPokemon.currentHP)}%`} variant={calcHP(backPlayerSelectedPokemon.pokemonId, backPlayerSelectedPokemon.currentHP) < 20 ? 'danger' : (calcHP(backPlayerSelectedPokemon.pokemonId, backPlayerSelectedPokemon.currentHP) < 50 ? 'warning' : 'success')} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col xs={4}>
                    <Card>
                        <Card.Header>
                            <div style={{float: 'right'}}>
                                {frontPlayer.party?.pokemon.map((pokemon, index) => {
                                    if(pokemon.currentHP > 0) return <img key={index} src={pokeball} alt='Pokéball' style={{height: '16px'}}/>
                                    else return <img key={index} src={pokeball} alt='Pokéball' style={{height: '16px', filter: 'grayscale(1)'}}/>
                                })}
                            </div>
                            <small>{frontPlayer.party?.owner} 's</small>
                            <br/>
                            {frontPlayerSelectedPokemon.nickname} <small>#{frontPlayerSelectedPokemon.pokemonId}</small>
                        </Card.Header>
                        <Card.Body>
                            <ProgressBar now={calcHP(frontPlayerSelectedPokemon.pokemonId, frontPlayerSelectedPokemonHP)} label={`${calcHP(frontPlayerSelectedPokemon.pokemonId, frontPlayerSelectedPokemonHP)}%`} variant={calcHP(frontPlayerSelectedPokemon.pokemonId, frontPlayerSelectedPokemonHP) < 20 ? 'danger' : (calcHP(frontPlayerSelectedPokemon.pokemonId, frontPlayerSelectedPokemonHP) < 50 ? 'warning' : 'success')} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={4}>
                    <img className='sprite' src={sprites.back? sprites.back: ""} alt={`${frontPlayerSelectedPokemon.nickname}'s front`} />
                </Col>
            </Row>
            <hr/>
            <p className='noMargin smallText'>{`Status: ${statusOverride}`}</p>
            <hr/>
            <Row>
                <Col className='textAlignCenter'>
                    {battle.current.status <= 2?
                        <>
                            <p>{`What will ${frontPlayerSelectedPokemon.nickname} do?`}</p>
                            {loadingMoves ? <p>Loading</p>:
                            frontPlayerSelectedPokemonMoves.map((move, index) => (
                                <Button key={move.moveId} className='battleMove' size='sm' disabled={frontPlayerStatus !== 0 || move.currentPP < 1} variant='outline-success' onClick={() => handlePerformAction(0, index, getSpeed(frontPlayerSelectedPokemon), { moveName: selectedPokemonMoves[index].name, movePower: selectedPokemonMoves[index].power })}>
                                    <p>{formatedMove(selectedPokemonMoves[index].name)} <TypeTag typeName={selectedPokemonMoves[index].type.name}/></p>
                                    <p>{`PP: ${move.currentPP}`}</p>
                                </Button>
                            ))}
                            <p style={{marginTop: '16px'}}>~ OR ~</p>
                            <Button className='battleMove' size='sm' variant='outline-dark' disabled={frontPlayerStatus !== 0} onClick={() => handlePerformAction(1, 1, 1000)}>Switch Pokémon</Button>
                            <Button className='battleMove' size='sm' variant='outline-danger' disabled={frontPlayerStatus !== 0} onClick={() => handlePerformAction(2, 1, 1001)}>Give Up</Button>
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
