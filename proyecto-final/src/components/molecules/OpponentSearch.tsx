import React from 'react'
import { Filter } from './Filter'
import { Card, FloatingLabel, Form } from 'react-bootstrap';
import CSS from 'csstype';
import { useFirebaseUsersContext } from '../../contexts/FirebaseUsersContext';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { IUserWrapper } from '../../models/IUser';

const SELECTED_OPPONENT_DEFAULT_VALUE = '-any-';

interface IOpponentSearchProps {
    style?: CSS.Properties;
    reset?: number;

    handleOpponentSelect?: (uid: string) => void;
}

export const OpponentSearch: React.FC<IOpponentSearchProps> = ({style, handleOpponentSelect, reset}) => {
    const [opponents, setOpponents] = React.useState<IUserWrapper[]>([]);
    const [ filter, setFilter ] = React.useState('');
    const [ selectedOpponentValue, setSelectedOpponentValue ] = React.useState(SELECTED_OPPONENT_DEFAULT_VALUE);

    const { users } = useFirebaseUsersContext();
    const { authUser } = useFirebaseAuth();

    const handleFilterUpdate = (value: string) => {
        setFilter(value);
    };

    const localHandleOpponentSelect = (value: string) => {
        console.log(value);
        setSelectedOpponentValue(value);
        if(handleOpponentSelect) handleOpponentSelect(value);
    };

    const loadOpponents = React.useCallback(() => {
        setOpponents(users.filter(user => user.id !== authUser?.uid && user.data.displayName.indexOf(filter) >= 0).sort((a, b) => {
            if(a.data.displayName >= b.data.displayName) return 1;
            else return -1;
        }));
    }, [authUser, filter, users]);

    React.useEffect(() => {
        if(reset === 2) setSelectedOpponentValue(SELECTED_OPPONENT_DEFAULT_VALUE);
    }, [reset]);

    React.useEffect(() => {
        loadOpponents();
    }, [loadOpponents]);

    return (
        <>
            <Card style={style}>
                <Card.Header>Select your opponent:</Card.Header>
                <Card.Body>
                    <Filter variant='text-only' input={{label: "Opponent's display name", handleUpdate: handleFilterUpdate}} reset={reset}/>

                    <FloatingLabel label='Opponent'>
                        <Form.Select onChange={e => localHandleOpponentSelect(e.target.value)} value={selectedOpponentValue}>
                            <option value={SELECTED_OPPONENT_DEFAULT_VALUE}>- Anyone -</option>
                            {opponents.map((user) => <option key={user.id} value={user.id}>{user.data.displayName}</option>)}
                        </Form.Select>
                    </FloatingLabel>

                </Card.Body>
            </Card>
        </>
    )
}
