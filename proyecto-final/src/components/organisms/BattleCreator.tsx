import React from 'react'
import { OpponentSearch } from '../molecules/OpponentSearch'
import { TeamsList } from '../pages/TeamsList'
import { Button, Card, Form } from 'react-bootstrap'
import { IBattle } from '../../models/IBattle'
import { IParty } from '../../models/IParty'
import { createRandomTeam, encode } from '../../util'
import { saveBattle } from '../../services/firebase-battles'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'
import { usePokedexContext } from '../../contexts/PokedexContext'
import { SpinnerCustom } from '../atoms/SpinnerCustom'
import { useNavigate } from 'react-router-dom'

export const BattleCreator = () => {
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

    const [newBattle, setNewBattle] = React.useState<IBattle>(defaultBattle);
    const [saving, setSaving] = React.useState(0);

    const { authUser } = useFirebaseAuth();
    const { pokedex } = usePokedexContext();
    const navigate = useNavigate();

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
        if(!authUser) {
            navigate('/login');
            return;
        }

        setSaving(1);
        const battle = newBattle;
        battle.id = encode(`temp-${authUser.uid}-${Date.now()}`);
        battle.date = Date.now();

        if(!battle.player1.party) battle.player1.party = await createRandomTeam(authUser, pokedex);
        //console.log(battle.player1.party);

        await saveBattle(battle, authUser);
        //console.log(battle);

        setSaving(2);
        setNewBattle(defaultBattle);
        setTimeout(() => setSaving(0), 2000);
    };

    return (
        <>
            <h6>Create a Battle</h6>

            <OpponentSearch style={{marginBottom: '10px'}} handleOpponentSelect={handleOpponentSelect} reset={saving}/>

            <TeamsList variant='select' style={{marginBottom: '10px'}} handleTeamSelect={handleTeamSelect} reset={saving}/>

            <Card style={{marginBottom: '10px'}}>
                <Card.Header>Battle Options:</Card.Header>
                <Card.Body>
                    <Form.Check id='ckBlind' type='checkbox' label='Blind' checked={newBattle.config.blind} onChange={handleBlindCheck}/>
                    <p style={{textAlign: 'justify'}}>In blind battles the challenged player cannot see the opponent's team before picking a team.</p>
                    <Form.Check id='ckTimed' type='checkbox' label='Timed' checked={newBattle.config.timed} onChange={handleTimedCheck} disabled/>
                    <p style={{textAlign: 'justify'}}>In timed battles each player has 15 seconds to pick an action. Not picking an action in set time will result in the corresponding player losing the match.</p>
                </Card.Body>
            </Card>

            <Button style={{width: '100%'}} onClick={handleCreateBattle} disabled={saving !== 0}>{saving === 0 ? 'Submit Challenge' : (saving === 1 ? <SpinnerCustom as='span' variant='light' /> : 'Challenge submitted!')}</Button>
        </>
    )
}
