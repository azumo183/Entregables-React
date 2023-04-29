import React from 'react'
import { Button, Card, Modal } from 'react-bootstrap'
import { IBattle } from '../../models/IBattle';
import { TeamsList } from '../pages/TeamsList';
import { IParty } from '../../models/IParty';
import { PokemonIcon } from '../atoms/PokemonIcon';

interface ITeamSelectModalProps {
    battle: IBattle;
    showModal: boolean;
    setShowModal: (state: boolean) => void;
    handleTeamConfirm: (team: IParty | undefined, battle: IBattle) => void;
}

export const TeamSelectModal: React.FC<ITeamSelectModalProps> = ({battle, showModal, setShowModal, handleTeamConfirm}) => {
    let selectedTeam: IParty | undefined = undefined;
    const handleTeamSelect = (team: IParty | undefined) => {
        selectedTeam = team;
    };

    return (
        <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                //size='lg'
            >
                <Modal.Header closeButton />
                <Modal.Body>
                    <>
                        <p>{`Select a team to join the battle:`}</p>
                        <TeamsList variant='select' style={{marginBottom: '16px'}} handleTeamSelect={handleTeamSelect}/>

                        <p className='textAlignCenter noMargin'>vs.</p>

                        <Card style={{marginTop: '16px', marginBottom: '16px'}}>
                            <Card.Header>Opponent Team Summary:</Card.Header>
                            <Card.Body className='textAlignCenter'>
                                {
                                    !battle.config.blind ? 
                                    battle.player1.party?.pokemon.map((pokemon, index) => <PokemonIcon key={index} pokemonId={pokemon.pokemonId}/>) : 
                                    <>
                                        <PokemonIcon pokemonId={0}/>
                                        <PokemonIcon pokemonId={0}/>
                                        <PokemonIcon pokemonId={0}/>
                                        <PokemonIcon pokemonId={0}/>
                                        <PokemonIcon pokemonId={0}/>
                                        <PokemonIcon pokemonId={0}/>
                                        <br/>
                                        <small>( Blind battle )</small>
                                    </>
                                }
                            </Card.Body>
                        </Card>

                        <div style={{display: 'block', textAlign: 'right'}}>
                            <Button style={{width: '120px', margin:'0px 4px'}} onClick={() => handleTeamConfirm(selectedTeam, battle)}>Confirm</Button>
                            <Button variant='outline-secondary' style={{width: '120px', margin:'0px 4px'}} onClick={() => setShowModal(false)}>Back</Button>
                        </div>
                    </>
                </Modal.Body>
                <Modal.Footer>
                    <p className='textAlignCenter smallText' style={{color: 'crimson', width: '100%'}}>Warning: Cannot change selected team after confirmation.</p>
                </Modal.Footer>
            </Modal>
    )
}
