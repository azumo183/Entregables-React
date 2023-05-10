import React from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'
import { callApi } from '../../util';
import { IPokemon } from '../../models/IPokemon';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
    const [sprites, setSprites] = React.useState<string[]>([]);

    const navigate = useNavigate();

    const loadSprites = React.useCallback(async () => {
        const response = await callApi(['https://pokeapi.co/api/v2/pokemon/3', 'https://pokeapi.co/api/v2/pokemon/6', 'https://pokeapi.co/api/v2/pokemon/9']);
        setSprites(response.map(element => (element.data as IPokemon).sprites.other['official-artwork'].front_default as string));
    }, []);

    React.useEffect(() => {
        loadSprites();
    }, [loadSprites]);

    return (
        <>
            <Row style={{padding: '32px 32px 16px 32px'}}>
                <Col style={{padding: '0px'}}>
                    <Card style={{height: '246px'}}>
                        <Card.Header><h3 style={{marginBottom: '0px'}}>Single Player Mode</h3></Card.Header>
                        <Card.Body style={{backgroundImage: `url(${sprites[0]})`, backgroundRepeat: 'no-repeat', backgroundPositionY: '-170px', backgroundPositionX: 'right', padding: '36px 0px 0px 36px'}}>
                            <p style={{textAlign: 'justify', width: '60%', fontSize: 'larger', marginBottom: '40px'}}>
                                Battle against a random team of AI Pokémon.
                            </p>
                            <Button style={{width: '120px'}} onClick={() => navigate('/ai-battle')}>Go!</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row style={{padding: '16px 32px'}}>
                <Col style={{padding: '0px'}}>
                    <Card style={{height: '246px'}}>
                        <Card.Header><h3 style={{marginBottom: '0px'}}>Online Multiplayer Mode</h3></Card.Header>
                        <Card.Body style={{backgroundImage: `url(${sprites[1]})`, backgroundRepeat: 'no-repeat', backgroundPositionY: '-60px', backgroundPositionX: 'right', padding: '36px 0px 0px 36px'}}>
                            <p style={{textAlign: 'justify', width: '60%', fontSize: 'larger', marginBottom: '40px'}}>
                                Battle against other Pokémon trainers ONLINE!
                            </p>
                            <Button style={{width: '120px'}} onClick={() => navigate('/battle')}>Go!</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row style={{padding: '16px 32px 32px 32px'}}>
                <Col style={{padding: '0px'}}>
                    <Card style={{height: '246px'}}>
                        <Card.Header><h3 style={{marginBottom: '0px'}}>Other Features</h3></Card.Header>
                        <Card.Body style={{backgroundImage: `url(${sprites[2]})`, backgroundRepeat: 'no-repeat', backgroundPositionY: 'top', backgroundPositionX: 'right', padding: '36px 0px 0px 36px'}}>
                            <p style={{textAlign: 'justify', width: '25%', marginBottom: '40px', display: 'inline-block', marginRight: '9%'}}>
                                Visit our Kanto Region Pokedex and learn more about the best Pokémon ever created, the mighty CHARIZARD!!
                                <br/>
                                <Button size='sm' style={{marginTop: '16px', width: '100%'}} onClick={() => navigate('/pokedex')}>Pokedex</Button>
                            </p>
                            <p style={{textAlign: 'justify', width: '25%', marginBottom: '40px', display: 'inline-block'}}>
                                <a href='/signup'>Create a free account</a> or <a href='/login'>login</a> to build awesome Pokémon teams to fight against your opponents.
                                <br/>
                                <Button size='sm' style={{marginTop: '16px', width: '100%'}} onClick={() => navigate('/teambuilder')}>Teambuilder</Button>
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}
