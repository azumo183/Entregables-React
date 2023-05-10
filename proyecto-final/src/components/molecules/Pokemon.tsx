import React from 'react'
import { IPokemon } from '../../models/IPokemon'
import { capFirst, formatedStat } from '../../util';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Card from 'react-bootstrap/Card';
import { Button, FloatingLabel, Form, Nav, Navbar } from 'react-bootstrap';
import { ArrowLeftShort, ArrowRightShort, ArrowReturnLeft, Trash3 } from 'react-bootstrap-icons';
import { usePokedexContext } from '../../contexts/PokedexContext';
import { PokemonIcon } from '../atoms/PokemonIcon';
import { TypeTag } from '../atoms/TypeTag';
import { Moves } from './Moves';
import { useTeambuilderContext } from '../../contexts/TeambuilderContext';
import { useNavigate } from 'react-router-dom';
import { Move } from '../atoms/Move';

interface IPokemonProps {
    pokemon: IPokemon;
    variant?: string;
}

export const Pokemon: React.FC<IPokemonProps> = ({pokemon, variant}) => {
    const { pokedex } = usePokedexContext();
    const { setShowModal, setSelectedPokemon, handleAddPokemon, handleNicknameChange } = useTeambuilderContext();
    const navigate = useNavigate();

    const [ nickname, setNickname ] = React.useState<string>(pokemon.partyPokemon?.nickname? pokemon.partyPokemon.nickname : capFirst(pokemon.name));

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleNicknameChange(pokemon, e.currentTarget.value);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNickname(e.target.value);
    };

    const handlePokemonDelete = () => {
        setSelectedPokemon(pokemon);
        setShowModal('del_pokemon');
    };

    const handleAddMove = () => {
        setSelectedPokemon(pokemon);
        setShowModal('moves');
    };

    const handlePokemonClicked = () => {
        if(handleAddPokemon.toString() !== '() => {}') handleAddPokemon(pokemon);
        else navigate(`/pokedex/${pokemon.id}`);
    };
    
    React.useEffect(() => {
        setNickname(pokemon.partyPokemon?.nickname? pokemon.partyPokemon.nickname : capFirst(pokemon.name));
    }, [pokemon]);

    if(variant && variant === 'pokedex') return (
        <button className='link myTableBody' onClick={handlePokemonClicked}>
            <Row>
                <Col>#{pokemon.id}</Col>
                <Col><PokemonIcon pokemonId={pokemon.id}/></Col>
                <Col>{capFirst(pokemon.name)}</Col>
                <Col>
                    <TypeTag typeName={pokemon.types[0].type.name}/>
                    {pokemon.types[1] ? <TypeTag typeName={pokemon.types[1].type.name}/> : <></>}
                </Col>
                { pokemon.stats.map(stat => <Col key={stat.stat.name}>{stat.base_stat}</Col>) }
            </Row>
        </button>        
    )

    if(variant && variant === 'party' && pokemon.partyPokemon) return (
        <Card className='sm-card' style={{marginBottom: '10px'}}>
            <Card.Header>
                <Row>
                    <Col xs={2} className='textAlignCenter'>
                        <PokemonIcon pokemonId={pokemon.id} style={{position: 'relative', top: '6px'}}/>
                        <br/>
                        <TypeTag typeName={pokemon.types[0].type.name}/>
                        <TypeTag typeName={pokemon.types[1]? pokemon.types[1].type.name: undefined}/>
                    </Col>
                    <Col xs={8}>
                        <FloatingLabel label='Pokémon Name or Nickname' style={{marginTop: '1px'}}>
                            <Form.Control type="text" value={nickname} onKeyDown={handleKeyDown} onBlur={e => handleNicknameChange(pokemon, e.currentTarget.value)} onChange={handleChange}/>
                        </FloatingLabel>
                    </Col>
                    <Col xs={2} className='textAlignCenter'><Button size='lg' variant='link' style={{color: 'white', position: 'relative', top: '4px'}} onClick={handlePokemonDelete}><Trash3/></Button></Col>
                </Row>
            </Card.Header>
            <Card.Body className='textAlignLeft'>
                <Row>
                    <Col>
                        {pokemon.partyPokemon.selectedMoves.length < 4 ? <Button size='sm' style={{float: 'right'}} onClick={handleAddMove}>Add Move</Button> : <></>}
                        <p className='smallText boldText'>{`Moves: ( ${pokemon.partyPokemon.selectedMoves.length}/4 )`}</p>
                    </Col>
                </Row>
                <Row style={{padding: '0px 12px'}}>
                    <Col>
                        <Row className='partyPokemonMoves'>
                            {pokemon.partyPokemon.selectedMoves.map((selectedMove, index) =>
                                <Col key={index} xs={6} style={{padding: '4px 12px'}}>
                                    <Move pokemon={pokemon} moveId={selectedMove.moveId}/>
                                </Col>
                            )}
                        </Row>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    )

    const sprites = {
        front: pokemon.sprites.versions['generation-v']['black-white'].animated.front_default,
        back: pokemon.sprites.versions['generation-v']['black-white'].animated.back_default,
    };

    return (
        <>
            <Navbar>
                <Nav>
                    <Nav.Link href='/pokedex'><ArrowReturnLeft/> Back to Pokédex</Nav.Link>
                </Nav>
                <Navbar.Collapse className="justify-content-end">
                    <Nav className='smallText prevNext'>
                        {pokemon.id > 1 ? <Nav.Link href={`/pokedex/${pokemon.id-1}`}>{capFirst(pokedex[pokemon.id-2].name)}<br/><ArrowLeftShort/> Previous</Nav.Link> : <div></div>}
                        {pokemon.id < pokedex.length ? <Nav.Link href={`/pokedex/${pokemon.id+1}`}>{capFirst(pokedex[pokemon.id].name)}<br/>Next <ArrowRightShort/></Nav.Link> : <></>}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            <h1>{capFirst(pokemon.name)} <small>#{pokemon.id}</small></h1>
            <Row>
                <Col>
                    <Card className='sm-card'>
                        <Card.Header>Appearance:</Card.Header>
                        <Card.Body>
                            <img className='sprite' src={sprites.front? sprites.front: ""} alt={`${capFirst(pokemon.name)}'s front`} />
                            <img className='sprite' src={sprites.back? sprites.back: ""} alt={`${capFirst(pokemon.name)}'s back`} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className='sm-card'>
                        <Card.Header>Type(s):</Card.Header>
                        <Card.Body>
                            <TypeTag typeName={pokemon.types[0].type.name}/>
                            {pokemon.types[1] ? <TypeTag typeName={pokemon.types[1].type.name}/> : <></>}
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className='sm-card'>
                        <Card.Header>Size:</Card.Header>
                        <Card.Body>
                            <Row>
                                <Col>{`Height: ${pokemon.height/10} m`}</Col>
                                <Col>{`Weight: ${pokemon.weight/10} kg`}</Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Card className='sm-card'>
                        <Card.Header>Base Stats:</Card.Header>
                        <Card.Body>
                            <Row>
                                { pokemon.stats.map(stat => <Col key={stat.stat.name}>{`${formatedStat(stat.stat.name)}: ${stat.base_stat}`}</Col>) }
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Moves pokemon={pokemon}/>
        </>
    )
}
