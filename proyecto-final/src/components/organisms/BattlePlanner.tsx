import React from 'react'
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { OpponentSearch } from '../molecules/OpponentSearch';
import { TeamsList } from '../pages/TeamsList';
import { IBattle, IPlayer } from '../../models/IBattle';
import { IParty } from '../../models/IParty';
import { encode, createRandomTeam, status } from '../../util';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { checkBothPlayersReady, getBattles, saveBattle, updateBattle, updateBattlePlayer2 } from '../../services/firebase';
import { usePokedexContext } from '../../contexts/PokedexContext';
import { BoxArrowInRight, ListStars, PlusLg } from 'react-bootstrap-icons';
import { TeamSelectModal } from '../molecules/TeamSelectModal';
import { useNavigate } from 'react-router-dom';
//import { FirebaseAdminContextProvider } from '../../contexts/FirebaseAdminContext';

export const BattlePlanner = () => {
    const defaultBattle = {
        id: '',
        date: 0,
        player1: {
            party: undefined,
            status: 0,
            selectedPokemon: 0,
        },
        player2: '-any-',
        status: 0,
        config: {
            blind: true,
            timed: false,
        },
    };

    const [battles, setBattles] = React.useState<IBattle[]>([]);
    const [newBattle, setNewBattle] = React.useState<IBattle>(defaultBattle);
    
    const [showModal, setShowModal] = React.useState(false);
    const [selectedActiveBattle, setSelectedActiveBattle] = React.useState<IBattle | undefined>();

    const [timer, setTimer] = React.useState(Date.now());

    const { authUser } = useFirebaseAuth();
    const { pokedex } = usePokedexContext(); 
    const navigate = useNavigate();

    const loadBattles = React.useCallback(async () => {
        if(!authUser) return;
        console.log(`BattlePlanner: loading battles ...`);
        const newBattles = await getBattles(authUser);
        setBattles(newBattles);
        setTimeout(() => setTimer(Date.now()), 5000);
    }, [authUser]);

    React.useEffect(() => {
        loadBattles();
    }, [timer, loadBattles]);

    const handleOpponentSelect = (uid: string) => {
        setNewBattle({...newBattle, player2: uid});
    };

    const handleTeamSelect = (team: IParty | undefined) => {
        setNewBattle({...newBattle, player1: {...newBattle.player1, party: team}});
    };

    const handleBlindCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewBattle({...newBattle, config: {...newBattle.config, blind: e.target.checked }});
    };

    const handleTimedCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewBattle({...newBattle, config: {...newBattle.config, timed: e.target.checked }});
    };

    const handleCreateBattle = async () => {
        if(!authUser) return;

        const battle = newBattle;
        battle.id = encode(`temp-${authUser.uid}-${Date.now()}`);
        battle.date = Date.now();

        if(!battle.player1.party){
            battle.player1.party = await createRandomTeam(authUser, pokedex);
            //console.log(battle.player1.party);
        }

        await saveBattle(battle, authUser);
        //console.log(battle);

        //setNewBattle(defaultBattle);
        //may need some select resets
    };

    const handleAcceptBattle = async (battle: IBattle) => {
        if(!authUser) return;
        await updateBattlePlayer2({ ...battle, player2: authUser.uid, status: 1});
        loadBattles();
    }

    const handleShowModal = (battle: IBattle) => {
        setSelectedActiveBattle(battle);
        setShowModal(true);
    };

    const handleOpponentTeamConfirm = async (team: IParty | undefined, battle: IBattle) => {
        if(!authUser) return;
        if(!team) team = await createRandomTeam(authUser, pokedex);
        //console.log(team);

        await updateBattle(battle, { player2: {party: team, status: 0, selectedPokemon: 0} }, authUser, true);
        setShowModal(false);
        loadBattles();
    }

    const handleReadyForBattle = async (battle: IBattle, ready: boolean, areYouPlayer1: boolean) => {
        if(!authUser) return;
        if(areYouPlayer1) await updateBattle(battle, { player1: { status: (ready ? 2 : 0) } }, authUser, true);
        else await updateBattle(battle, { player2: { status: (ready ? 2 : 0) } }, authUser, true);
        const bothPlayersReady = await checkBothPlayersReady(battle);
        //if(bothPlayersReady) goToBattle(battle); //auto-load?
        loadBattles();
    }

    const goToBattle = (battle: IBattle) => {
        navigate(`/${battle.id}`);
    };

    const loadBattleContent = (battle: IBattle) => {
        const areYouPlayer1 = battle.player1.party?.owner === authUser?.uid;
        const p1 = areYouPlayer1 ? '[ You ]' : battle.player1.party?.owner;
        const p2 = (battle.player2 as IPlayer).party ? 
            ((battle.player2 as IPlayer).party?.owner === authUser?.uid ? '[ You ]' : (battle.player2 as IPlayer).party?.owner) :
            (battle.player2 === '-any-' ? '[ Anyone ]' : (battle.player2 === authUser?.uid ? '[ You ]' : battle.player2));

        const yourStatus = areYouPlayer1? battle.player1.status : (Number.isInteger((battle.player2 as IPlayer).status) ? (battle.player2 as IPlayer).status : 1);

        return(
            <>
                <Card.Header>
                    <div className='battleListOpts'>
                        {!areYouPlayer1 && battle.status === 0 ? <Button size='sm' variant='success' onClick={() => handleAcceptBattle(battle)}><PlusLg/> Accept Challenge</Button> : <></>}
                        
                        {!areYouPlayer1 && battle.status === 1 && yourStatus === 1 ? <Button size='sm' variant='primary' onClick={() => handleShowModal(battle)}><ListStars/> Select Team</Button> : <></>}
                        {battle.status === 1 && yourStatus !== 1 ? 
                        <Form.Switch className='mySwitch' label={`Ready!`} checked={areYouPlayer1 ? battle.player1.status === 2 : (battle.player2 as IPlayer).status === 2} onChange={e => handleReadyForBattle(battle, e.target.checked, areYouPlayer1)} style={{fontSize: 'large'}}/>
                        : <></>}

                        {battle.status === 2 ? <Button size='sm' onClick={() => goToBattle(battle)}><BoxArrowInRight/> Go to battle</Button> : <></>}
                    </div>

                    {`${p1} vs. ${p2}`}
                </Card.Header>
                <Card.Body style={{padding: '8px 16px'}}>
                    {`Status: ${status[battle.status][yourStatus]}`}
                </Card.Body>
            </>
        )
    };

    return (
        <>
            <h1>Battle Hub</h1>
            <Row>
                <Col xs={4} style={{padding: '10px'}}>
                    <h6>Create a Battle</h6>

                    {/*<FirebaseAdminContextProvider>*/}
                        <OpponentSearch style={{marginBottom: '10px'}} handleOpponentSelect={handleOpponentSelect}/>
                    {/*</FirebaseAdminContextProvider>*/}

                    <TeamsList variant='select' style={{marginBottom: '10px'}} handleTeamSelect={handleTeamSelect}/>

                    <Card style={{marginBottom: '10px'}}>
                        <Card.Header>Battle Options:</Card.Header>
                        <Card.Body>
                            <Form.Check id='ckBlind' type='checkbox' label='Blind' checked={newBattle.config.blind} onChange={handleBlindCheck}/>
                            <p style={{textAlign: 'justify'}}>In blind battles the challenged player cannot see the opponent's team before picking a team.</p>
                            <Form.Check id='ckTimed' type='checkbox' label='Timed' checked={newBattle.config.timed} onChange={handleTimedCheck} disabled/>
                            <p style={{textAlign: 'justify'}}>In timed battles each player has 15 seconds to pick an action. Not picking an action in set time will result in the corresponding player losing the match.</p>
                        </Card.Body>
                    </Card>

                    <Button style={{width: '100%'}} onClick={handleCreateBattle}>Challenge ‼</Button>

                </Col>
                <Col xs={8} style={{padding: '10px'}}>
                    <h6>{`Active Battles: ( ${battles.length} )`}</h6>

                    <Card>
                        <Card.Body className='smallText'>
                            {battles.map((battle) => (
                                <Card key={battle.id} className='textAlignLeft' style={{marginBottom: '6px'}}>
                                    {loadBattleContent(battle)}
                                </Card>
                            ))}
                        </Card.Body>
                    </Card>

                </Col>
            </Row>

            {selectedActiveBattle? <TeamSelectModal showModal={showModal} setShowModal={setShowModal} battle={selectedActiveBattle} handleTeamConfirm={handleOpponentTeamConfirm}/> : <></>}
            
        </>
    )
}
