import React from 'react'
import { Button, Col, Container, FloatingLabel, Form, Modal, Row } from 'react-bootstrap'
import { usePokedexContext } from '../../contexts/PokedexContext';
import { Pokemon } from '../molecules/Pokemon';
import { Pokedex } from './Pokedex';
import { Moves } from '../molecules/Moves';
import { useTeambuilderContext } from '../../contexts/TeambuilderContext';
import { capFirst, formatedMove } from '../../util';
import { IPokemon } from '../../models/IPokemon';
import { IMove } from '../../models/IMove';
import { useNavigate } from 'react-router-dom';
import { SpinnerCustom } from '../atoms/SpinnerCustom';
import { ArrowReturnLeft, PersonFillAdd } from 'react-bootstrap-icons';

export const Teambuilder = () => {
    const [ errors, setErrors ] = React.useState<string[]>([]);

    const { pokedex, loading } = usePokedexContext();
    const { team, loadingTeam, showModal, selectedPokemon, selectedMove, setTeam, setShowModal, handleDeletePokemon, handleDeleteMove, handleTeamSave } = useTeambuilderContext();
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

    if(loading || loadingTeam) return <SpinnerCustom/>
    if(!team) return <p>Wooops! Something went wrong ...</p>

    return (
        <>
            <h1>Teambuilder</h1>
            <Row>
                <Col>
                    <FloatingLabel label='Team Name' style={{marginBottom: '8px'}}>
                        <Form.Control type="text" value={team.name} onChange={e => setTeam({...team, name: e.target.value})}/>
                    </FloatingLabel>
                </Col>
            </Row>
            <Row>
                <Col>
                    {team.pokemon.length < 6 ? <Button style={{float: 'right'}} onClick={() => setShowModal('pokedex')}><PersonFillAdd/> Add Pokémon</Button> : <></>}
                    <h6 style={{marginBottom: '26px'}}>{`Pokémon: ( ${team.pokemon.length}/6 )`}</h6>
                </Col>
            </Row>
            <div style={{minHeight: 'calc(100vh - 335px)'}}>
                <Row id="partyPokemon">
                    {team.pokemon.map((pokemon, index) => <Col key={index} xs={6}><Pokemon variant='party' pokemon={{...pokedex[pokemon.pokemonId-1], partyPokemon: pokemon}}/></Col> )}
                </Row>
            </div>
            <Row>
                <Col className='textAlignRight'>
                    {errors.length > 0? (
                        <div className='textAlignLeft smallText' style={{float: 'left', color: 'crimson'}}>
                            <h6>Attention:</h6>
                            <ul>
                                {errors.map(error => <li>{error}</li>)}
                            </ul>
                        </div>
                    ): <></>}
                    <Button size='lg' variant='success' style={{margin: '4px 4px 16px 4px', width: '160px'}} onClick={checkTeamBeforeSaving}>Save Changes</Button>
                    <Button size='lg' variant='outline-secondary' style={{margin: '4px 4px 16px 4px', width: '160px'}} onClick={() => navigate('/teambuilder')}>Back</Button>
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
                    {!showModal.startsWith('del_') ? <Button variant='link' onClick={() => setShowModal('false')} style={{textDecoration: 'none'}}><ArrowReturnLeft/> Back to Team</Button> : <></>}
                </Modal.Header>
                <Modal.Body>
                    {showModal === 'pokedex' ? <Container><Pokedex variant='pick'/></Container> : <></>}
                    {showModal === 'moves' ? <Container><Moves pokemon={selectedPokemon as IPokemon}/></Container> : <></>}
                    {showModal === 'del_pokemon' ? (
                        <>
                            <p>{`Are you sure you want to remove ${(selectedPokemon as IPokemon).partyPokemon?.nickname ? `'${(selectedPokemon as IPokemon).partyPokemon?.nickname}'` : `that '${capFirst((selectedPokemon as IPokemon).name)}'`}?`}</p>
                            <div style={{float: 'right'}}>
                                <Button variant='danger' style={{width: '120px', margin:'0px 4px'}} onClick={handleDeletePokemon}>Yes</Button>
                                <Button variant='outline-secondary' style={{width: '120px', margin:'0px 4px'}} onClick={() => setShowModal('false')}>No</Button>
                            </div>
                        </>
                    ) : <></>}
                    {showModal === 'del_move' ? (
                        <>
                            <p>{`Are you sure you want to remove '${formatedMove((selectedMove as IMove).name)}' from ${selectedPokemon?.partyPokemon?.nickname ? `'${selectedPokemon.partyPokemon?.nickname}'` : `that '${capFirst(selectedPokemon?.name)}'`}?`}</p>
                            <div style={{float: 'right'}}>
                                <Button variant='danger' style={{width: '120px', margin:'0px 4px'}} onClick={handleDeleteMove}>Yes</Button>
                                <Button variant='outline-secondary' style={{width: '120px', margin:'0px 4px'}} onClick={() => setShowModal('false')}>No</Button>
                            </div>
                        </>
                    ) : <></>}
                </Modal.Body>
            </Modal>
        </>
    )
}
