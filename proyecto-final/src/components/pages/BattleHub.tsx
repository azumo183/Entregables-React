import React from 'react'
import { Card, Col, Row } from 'react-bootstrap';
import { IBattle } from '../../models/IBattle';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { getBattlesLive } from '../../services/firebase-battles';
import { BattleCreator } from '../organisms/BattleCreator';
import { BattleOptions } from '../molecules/BattleOptions';

export const BattleHub = () => {
    const [battles, setBattles] = React.useState<IBattle[]>([]);

    const { authUser } = useFirebaseAuth();

    React.useEffect(() => {
        if(!authUser) return;
        console.log(`BattlePlanner: loading battles ...`);
        getBattlesLive(authUser, setBattles);
    }, [authUser]);

    return (
        <>
            <h1>Battle Hub</h1>
            <Row>
                <Col xs={4} style={{padding: '10px'}}>
                    <BattleCreator/>
                </Col>
                <Col xs={8} style={{padding: '10px'}}>
                    <h6>{`Active Battles: ( ${battles.length} )`}</h6>

                    <Card>
                        <Card.Body className='smallText'>
                            {battles.map((battle) => <BattleOptions key={battle.id} battle={battle}/>)}
                        </Card.Body>
                    </Card>

                </Col>
            </Row>            
        </>
    )
}
