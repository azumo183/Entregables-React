import React from 'react'
import { Button, Col, Container, FloatingLabel, Form, Modal, Row } from 'react-bootstrap'
import { usePokedexContext } from '../../contexts/PokedexContext';
import CSS from 'csstype';
import { Pokemon } from '../molecules/Pokemon';
import { Pokedex } from './Pokedex';
import { Moves } from '../molecules/Moves';
import { useTeambuilderContext } from '../../contexts/TeambuilderContext';
import { capFirst, formatedMove } from '../../util';
import { IPokemon } from '../../models/IPokemon';
import { IMove } from '../../models/IMove';
import { useNavigate } from 'react-router-dom';

export const Teambuilder = () => {
    const [ errors, setErrors ] = React.useState<string[]>([]);

    const { pokedex, loading } = usePokedexContext();
    const { team, setTeam, loadingTeam, showModal, setShowModal, deletingPokemon, handlePokemonDelete, workingOnPokemon, handleMoveDelete, deletingMove, handleTeamSave } = useTeambuilderContext();
    const navigate = useNavigate();

    const checkTeamBeforeSaving = () => {
        const err = [];
        if(!team){
            err.push("Wooops! Something went wrong ... try reloading the page");
            setErrors(err);
            return;
        }
        if(team.pokemon.length === 0) err.push("You need to add at least one pokémon to the team before saving");
        else team.pokemon.forEach((pokemon, index) => {
            if(pokemon.selectedMoves.length === 0)
                err.push(`You need to add at least one move to ${pokemon.nickname ? pokemon.nickname : capFirst(pokedex[pokemon.pokemonId-1].name)} (slot ${index+1}) before saving`);
        });
        if(err.length > 0) setErrors(err);
        else handleTeamSave();
    };

    if(loading || loadingTeam) return <p>Loading ...</p>
    if(!team) return <p>Wooops! Something went wrong ...</p>

    return (
        <>
            <h1>Teambuilder</h1>
            <Row>
                <Col>
                    <FloatingLabel label='Team Name' style={{marginBottom: '8px'} as CSS.Properties}>
                        <Form.Control type="text" value={team.name} onChange={e => setTeam({...team, name: e.target.value})}/>
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col>
                    {team.pokemon.length < 6 ? <Button size='sm' style={{float: 'right'} as CSS.Properties} onClick={() => setShowModal('pokedex')}>Add Pokémon</Button> : <></>}
                    <h6 style={{marginBottom: '20px'} as CSS.Properties}>{`Pokémon: ( ${team.pokemon.length}/6 )`}</h6>
                </Col>
            </Row>
            <Row id="partyPokemon">
                {team.pokemon.map((pokemon, index) => <Col key={index} xs={6}><Pokemon variant='party' pokemon={{...pokedex[pokemon.pokemonId-1], partyPokemon: pokemon}}/></Col> )}
            </Row>
            <Row>
                <Col className='textAlignRight'>
                    {errors.length > 0? (
                        <div className='textAlignLeft smallText' style={{float: 'left', color: 'crimson'} as CSS.Properties}>
                            <h6>Attention:</h6>
                            <ul>
                                {errors.map(error => <li>{error}</li>)}
                            </ul>
                        </div>
                    ): <></>}
                    <Button size='lg' variant='success' style={{margin: '0px 4px', width: '160px'} as CSS.Properties} onClick={checkTeamBeforeSaving}>Save Changes</Button>
                    <Button size='lg' variant='outline-secondary' style={{margin: '0px 4px', width: '160px'} as CSS.Properties} onClick={() => navigate('/teambuilder')}>Back</Button>
                </Col>
            </Row>

            <Modal
                show={showModal !== 'false'}
                onHide={() => setShowModal('false')}
                size={showModal.startsWith('del_') ? undefined :'xl'}
                centered
                scrollable
                fullscreen={showModal.startsWith('del_') ? undefined : true}
            >
                <Modal.Header closeButton>
                    {!showModal.startsWith('del_') ? <Button variant='link' onClick={() => setShowModal('false')}>Back to Team</Button> : <></>}
                </Modal.Header>
                <Modal.Body>
                    {showModal === 'pokedex' ? <Container><Pokedex variant='pick'/></Container> : <></>}
                    {showModal === 'moves' ? <Container><Moves pokemon={workingOnPokemon as IPokemon}/></Container> : <></>}
                    {showModal === 'del_pokemon' ? (
                        <>
                            <p>{`Are you sure you want to remove ${(deletingPokemon as IPokemon).partyPokemon?.nickname ? `'${(deletingPokemon as IPokemon).partyPokemon?.nickname}'` : `that '${capFirst((deletingPokemon as IPokemon).name)}'`}?`}</p>
                            <div style={{float: 'right'} as CSS.Properties}>
                                <Button variant='danger' style={{width: '120px', margin:'0px 4px'} as CSS.Properties} onClick={handlePokemonDelete}>Yes</Button>
                                <Button variant='outline-secondary' style={{width: '120px', margin:'0px 4px'} as CSS.Properties} onClick={() => setShowModal('false')}>No</Button>
                            </div>
                        </>
                    ) : <></>}
                    {showModal === 'del_move' ? (
                        <>
                            <p>{`Are you sure you want to remove '${formatedMove((deletingMove as IMove).name)}' from ${workingOnPokemon?.partyPokemon?.nickname ? `'${workingOnPokemon.partyPokemon?.nickname}'` : `that '${capFirst(workingOnPokemon?.name)}'`}?`}</p>
                            <div style={{float: 'right'} as CSS.Properties}>
                                <Button variant='danger' style={{width: '120px', margin:'0px 4px'} as CSS.Properties} onClick={handleMoveDelete}>Yes</Button>
                                <Button variant='outline-secondary' style={{width: '120px', margin:'0px 4px'} as CSS.Properties} onClick={() => setShowModal('false')}>No</Button>
                            </div>
                        </>
                    ) : <></>}
                </Modal.Body>
            </Modal>
        </>
    )
}
