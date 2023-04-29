import React from 'react'
import { Filter } from './Filter'
import { Card, FloatingLabel, Form } from 'react-bootstrap';
import CSS from 'csstype';

interface IOpponentSearchProps {
    style?: CSS.Properties;

    handleOpponentSelect?: (uid: string) => void;
}

export const OpponentSearch: React.FC<IOpponentSearchProps> = ({style, handleOpponentSelect}) => {
    const [opponents, setOpponents] = React.useState<string[]>([]);

    const handleFilterEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {

    };

    const handleFilterBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {

    };

    const loadOpponents = React.useCallback(() => {

    }, []);

    React.useEffect(() => {
        loadOpponents();
    }, [loadOpponents]);

    return (
        <>
            <Card style={style}>
                <Card.Header>Select your opponent:</Card.Header>
                <Card.Body>
                    <Filter variant='text-only' input={{label: "Opponent's Email or Username", handleEnter: handleFilterEnter, handleBlur: handleFilterBlur}}/>

                    <FloatingLabel label='Opponent'>
                        <Form.Select onChange={e => handleOpponentSelect? handleOpponentSelect(e.target.value) : {}}>
                            <option value={'-any-'}>- Anyone -</option>
                            {opponents.map((option, index) => <option key={option} value={index}>{option}</option>)}
                        </Form.Select>
                    </FloatingLabel>

                </Card.Body>
            </Card>
        </>
    )
}
