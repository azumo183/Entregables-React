import React from 'react'
import { Card, Col, Row } from 'react-bootstrap';
import { LifeBar } from '../atoms/LifeBar';
import { IPlayer } from '../../models/IBattle';
import pokeball from '../../resources/Poké_Ball_icon.svg.png'
import { useFirebaseUsersContext } from '../../contexts/FirebaseUsersContext';
import { IParty } from '../../models/IParty';
import { usePokedexContext } from '../../contexts/PokedexContext';

interface IBattleSideProps {
    front: boolean;
    player: IPlayer;
}

export const BattleSide: React.FC<IBattleSideProps> = ({front, player}) => {
    const { getUserDisplayName } = useFirebaseUsersContext();
    const { getFrontSprite, getBackSprite } = usePokedexContext();

    if(front) return (
        <Row>
            <Col xs={4}>
                <Card>
                    <Card.Header>
                        <div style={{float: 'right'}}>
                            {player.party?.pokemon.map((pokemon, index) => <img key={index} src={pokeball} alt='Pokéball' style={{height: '16px', filter: `grayscale(${pokemon.currentHP > 0? 0: 1})`}}/>)}
                        </div>
                        <small>{`${getUserDisplayName(player.party?.owner as string)}'s`}</small>
                        <br/>
                        {(player.party as IParty).pokemon[player.selectedPokemon].nickname} <small>#{(player.party as IParty).pokemon[player.selectedPokemon].pokemonId}</small>
                    </Card.Header>
                    <Card.Body>
                        <LifeBar pokemon={(player.party as IParty).pokemon[player.selectedPokemon]}/>
                    </Card.Body>
                </Card>
            </Col>
            <Col xs={4}>
                <img className='sprite' src={getBackSprite((player.party as IParty).pokemon[player.selectedPokemon].pokemonId)} alt={`${(player.party as IParty).pokemon[player.selectedPokemon].nickname}'s front`} />
            </Col>
        </Row>
    )

    return (
        <Row>
            <Col xs={8} className='textAlignRight'>
                <img className='sprite' src={getFrontSprite((player.party as IParty).pokemon[player.selectedPokemon].pokemonId)} alt={`${(player.party as IParty).pokemon[player.selectedPokemon].nickname}'s front`} />
            </Col>
            <Col xs={4}>
                <Card>
                    <Card.Header>
                        <div style={{float: 'right'}}>
                            {player.party?.pokemon.map((pokemon, index) => <img key={index} src={pokeball} alt='Pokéball' style={{height: '16px', filter: `grayscale(${pokemon.currentHP > 0? 0: 1})`}}/>)}
                        </div>
                        <small>{`${getUserDisplayName(player.party?.owner as string)}'s`}</small>
                        <br/>
                        {(player.party as IParty).pokemon[player.selectedPokemon].nickname} <small>#{(player.party as IParty).pokemon[player.selectedPokemon].pokemonId}</small>
                    </Card.Header>
                    <Card.Body>
                        <LifeBar pokemon={(player.party as IParty).pokemon[player.selectedPokemon]}/>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    )
}
