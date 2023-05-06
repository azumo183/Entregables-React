import React from 'react'
import { IBattle, IPlayer } from '../../models/IBattle';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { useFirebaseUsersContext } from '../../contexts/FirebaseUsersContext';
import { Button, Card, Form } from 'react-bootstrap';
import { BoxArrowInRight, CheckLg, ListStars, XLg } from 'react-bootstrap-icons';
import { checkBothPlayersReady, updateBattle, updateBattlePlayer2 } from '../../services/firebase-battles';
import { createRandomTeam, status } from '../../util';
import { IParty } from '../../models/IParty';
import { usePokedexContext } from '../../contexts/PokedexContext';
import { useNavigate } from 'react-router-dom';
import { TeamSelectModal } from './TeamSelectModal';

interface IBattleOptions {
    battle: IBattle;
}

export const BattleOptions: React.FC<IBattleOptions> = ({battle}) => {
    const [showModal, setShowModal] = React.useState(false);

    const { authUser } = useFirebaseAuth();
    const { users } = useFirebaseUsersContext();
    const { pokedex } = usePokedexContext();
    const navigate = useNavigate();

    const areYouPlayer1 = battle.player1.party?.owner === authUser?.uid;
    const p1 = users.find(user => user.id === battle.player1.party?.owner)?.data.displayName;
    const p2 = (battle.player2 as IPlayer).party ? 
        (users.find(user => user.id === (battle.player2 as IPlayer).party?.owner)?.data.displayName) :
        (battle.player2 === '-any-' ? '[ Anyone ]' : users.find(user => user.id === battle.player2)?.data.displayName);

    const yourStatus = areYouPlayer1? battle.player1.status : (Number.isInteger((battle.player2 as IPlayer).status) ? (battle.player2 as IPlayer).status : 1);

    const handleAcceptBattle = async () => {
        if(!authUser) return;
        await updateBattlePlayer2({ ...battle, player2: authUser.uid, status: 1}, authUser);
    }

    const handleDeclineBattle = async () => {
        if(!authUser) return;
        await updateBattlePlayer2({ ...battle, player2: authUser.uid, status: -1}, authUser);
    }

    const handleShowModal = () => {
        setShowModal(true);
    };

    const handleOpponentTeamConfirm = async (team: IParty | undefined) => {
        if(!authUser) return;
        if(!team) team = await createRandomTeam(authUser, pokedex);
        //console.log(team);

        await updateBattle(battle, { player2: {party: team, status: 0, selectedPokemon: 0} }, authUser, true);
        setShowModal(false);
    }

    const handleReadyForBattle = async (battle: IBattle, ready: boolean, areYouPlayer1: boolean) => {
        if(!authUser) return;
        if(areYouPlayer1) await updateBattle(battle, { player1: { status: (ready ? 2 : 0) } }, authUser, true);
        else await updateBattle(battle, { player2: { status: (ready ? 2 : 0) } }, authUser, true);
        const bothPlayersReady = await checkBothPlayersReady(battle);
        //if(bothPlayersReady) goToBattle(); //auto-load?
    }

    const goToBattle = () => {
        navigate(`/${battle.id}`);
    };

    return(
        <>
            <Card className='textAlignLeft' style={{marginBottom: '6px'}}>
                <Card.Header>
                    <div className='battleListOpts'>
                        {!areYouPlayer1 && battle.status === 0 ? (
                            <>
                                <Button size='sm' variant='success' onClick={handleAcceptBattle}><CheckLg/> Accept</Button>
                                {/* <Button size='sm' variant='danger' onClick={handleDeclineBattle}><XLg/> Decline</Button> */}
                            </>
                        ) : <></>}
                        
                        {!areYouPlayer1 && battle.status === 1 && yourStatus === 1 ? <Button size='sm' variant='primary' onClick={handleShowModal}><ListStars/> Select Team</Button> : <></>}
                        {battle.status === 1 && yourStatus !== 1 ? 
                        <Form.Switch className='mySwitch' label={`Ready!`} checked={areYouPlayer1 ? battle.player1.status === 2 : (battle.player2 as IPlayer).status === 2} onChange={e => handleReadyForBattle(battle, e.target.checked, areYouPlayer1)} style={{fontSize: 'large'}}/>
                        : <></>}

                        {battle.status === 2 ? <Button size='sm' onClick={goToBattle}><BoxArrowInRight/> Go to battle</Button> : <></>}
                    </div>

                    <span style={areYouPlayer1? {color: 'palegoldenrod', fontWeight: 'bold'} : undefined}>{p1}</span> vs. <span style={!areYouPlayer1? {color: 'palegoldenrod', fontWeight: 'bold'} : undefined}>{p2}</span>
                </Card.Header>
                <Card.Body style={{padding: '8px 16px'}}>
                    {`Status: ${status[battle.status][yourStatus]}`}
                </Card.Body>
            </Card>

            {showModal? <TeamSelectModal showModal={showModal} setShowModal={setShowModal} battle={battle} handleTeamConfirm={handleOpponentTeamConfirm}/> : <></>}
        </>
    )
}
