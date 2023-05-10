import React from 'react'
import { IAction, IActionData, IBattle, IPlayer } from '../../models/IBattle'
import { IMove } from '../../models/IMove';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { useFirebaseUsersContext } from '../../contexts/FirebaseUsersContext';
import { usePokedexContext } from '../../contexts/PokedexContext';
import { IParty, IPartyPokemon, ISelectedMove } from '../../models/IParty';
import { callApi, formatedMove, status } from '../../util';
import { SpinnerCustom } from '../atoms/SpinnerCustom';
import { BattleSide } from '../molecules/BattleSide';
import { Button, Col, Row } from 'react-bootstrap';
import { TypeTag } from '../atoms/TypeTag';
import { PokemonIcon } from '../atoms/PokemonIcon';
import { LifeBar } from '../atoms/LifeBar';

interface IAiBattleProps {
    battleProp: IBattle;
}

export const AiBattle: React.FC<IAiBattleProps> = ({battleProp}) => {
    const [battle, setBattle] = React.useState<IBattle>(battleProp);

    const [backPlayer, setBackPlayer] = React.useState<IPlayer>();
    const [frontPlayer, setFrontPlayer] = React.useState<IPlayer>();
    
    const [loadingMoves, setLoadingMoves] = React.useState(true);
    const [selectedPokemonMoves, setSelectedPokemonMoves] = React.useState<IMove[]>([]);

    const [statusOverride, setStatusOverride] = React.useState<string>();
    const [handlingTurn, setHandlingTurn] = React.useState(false);
    
    const actionsToExec = React.useRef<IAction[]>([]);
    const selectedPokemon = React.useRef(-1);

    const botSelectedPokemon = React.useRef(-1);
    const [loadingBotMoves, setLoadingBotMoves] = React.useState(true);
    const botSelectedPokemonMoves = React.useRef<IMove[]>([]);
    
    const { authUser } = useFirebaseAuth();
    const { getUserDisplayName } = useFirebaseUsersContext();
    const { getBaseStat } = usePokedexContext();

    const loadMoves = React.useCallback(async (pokemon: IPartyPokemon) => {
        console.log(`Battle: loading ${pokemon.nickname} moves ...`)
        setLoadingMoves(true);
        const response = await callApi(pokemon.selectedMoves.map(move => `https://pokeapi.co/api/v2/move/${move.moveId}`));
        const moves: IMove[] = [];
        response.forEach(element => moves.push(element.data as IMove));
        setSelectedPokemonMoves(moves);
        setLoadingMoves(false);
    }, []);

    const loadBotMoves = React.useCallback(async (pokemon: IPartyPokemon) => {
        console.log(`Battle: loading ${pokemon.nickname} moves ...`)
        setLoadingBotMoves(true);
        const response = await callApi(pokemon.selectedMoves.map(move => `https://pokeapi.co/api/v2/move/${move.moveId}`));
        botSelectedPokemonMoves.current = response.map(element => element.data as IMove);
        setLoadingBotMoves(false);
    }, []);

    const handlePerformAction = (type: number, option: number, speed: number, data?: IActionData) => {
        const playerAction: IAction = {
            type: type,
            option: option,
            speed: speed,
            data: data,
            owner: authUser?.uid ? authUser.uid : 'guest',
        };

        const botMove = botSelectedPokemonMoves.current.sort((a, b) => {
            if(a.power <= b.power) return 1;
            else return -1;
        })[0];

        const botAction: IAction = {
            type: 0,
            option: botSelectedPokemonMoves.current.indexOf(botMove),
            speed: getBaseStat(backPlayer?.party?.pokemon[backPlayer.selectedPokemon].pokemonId as number, 'speed'),
            data: {
                moveName: botMove.name,
                movePower: botMove.power,
                p2GoesFirst: false,
            },
            owner: '-bot-',
        };

        //console.log(botAction);

        actionsToExec.current = [playerAction, botAction];

        actionsToExec.current = botAction.speed > playerAction.speed || (playerAction.speed === botAction.speed && (Math.floor(Math.random() * 2) === 1)) ?
            [botAction, playerAction] : [playerAction, botAction];
        console.log(`Battle: actionsToExec set ...`);

        setHandlingTurn(true);
        execActions(actionsToExec.current, 0);
    };

    const execActions = (actions: IAction[], index: number) => {
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
            actionsToExec.current = [];
            if(battle.status !== 3) setHandlingTurn(false); // if battle is not over continue to next turn
        }
    };

    React.useEffect(() => {
        console.log(`Battle: defining sides ...`);
        setFrontPlayer(battle.player1);
        setBackPlayer((battle.player2 as IPlayer));
    }, [battle]);

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

    React.useEffect(() => {
        if(backPlayer?.selectedPokemon !== undefined && botSelectedPokemon.current !== backPlayer.selectedPokemon){
            loadBotMoves(backPlayer.party?.pokemon[backPlayer.selectedPokemon] as IPartyPokemon);
            botSelectedPokemon.current = backPlayer.selectedPokemon;
        }
    }, [backPlayer?.selectedPokemon, backPlayer?.party?.pokemon, loadBotMoves]);
    
    if(!frontPlayer || !backPlayer) return <p>Wooops! Something went wrong ...</p>

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
                                        <Button key={move.id} className='battleMove' size='sm' disabled={loadingBotMoves || handlingTurn || ((frontPlayer.party?.pokemon[frontPlayer.selectedPokemon] as IPartyPokemon).selectedMoves[index] as ISelectedMove).currentPP < 1} variant='outline-dark' onClick={() => handlePerformAction(0, index, getBaseStat((frontPlayer.party?.pokemon[frontPlayer.selectedPokemon] as IPartyPokemon).pokemonId, 'speed'), { moveName: move.name, movePower: move.power, p2GoesFirst: false })} style={{padding: '11px 8px'}}>
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
                                <Button key={index} className='battleMove' size='sm' variant='outline-dark' disabled={loadingBotMoves || handlingTurn || pokemon.currentHP === 0 || pokemon === (frontPlayer.party as IParty).pokemon[frontPlayer.selectedPokemon]} onClick={() => handlePerformAction(1, index, 1000)} style={pokemon === (frontPlayer.party as IParty).pokemon[frontPlayer.selectedPokemon]? {boxShadow: '0 0 0 0.25rem #20b2ab80'}: {}}>
                                    <p><PokemonIcon pokemonId={pokemon.pokemonId} style={{filter: `grayscale(${pokemon.currentHP > 0? 0 : 1})`}}/><span style={{position: 'relative', bottom: '6px'}}>{pokemon.nickname}</span></p>
                                    <LifeBar pokemon={pokemon} style={{margin: '2.5px 0px'}}/>
                                </Button>
                            )}
                        </Col>
                        
                        <Col sm={12}>
                            <hr/>
                            <Button className='battleMove' size='sm' variant='outline-danger' disabled={loadingBotMoves || handlingTurn} onClick={() => handlePerformAction(2, 1, 1001)} style={{float: 'right'}}>Give Up</Button>
                        </Col>
                    </>:
                    <Col sm={12}>
                        <a href='/ai-battle'>Back to AI Battle Setup</a>
                    </Col>
                }
            </Row>
        </>
    )
}
