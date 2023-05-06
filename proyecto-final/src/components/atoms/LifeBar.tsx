import React from 'react'
import { ProgressBar } from 'react-bootstrap'
import { IPartyPokemon } from '../../models/IParty'
import { usePokedexContext } from '../../contexts/PokedexContext';
import CSS from 'csstype';

interface ILifeBarProps {
    pokemon: IPartyPokemon;
    style?: CSS.Properties;
}

export const LifeBar: React.FC<ILifeBarProps> = ({pokemon, style}) => {
    const { getBaseStat } = usePokedexContext();
    const value = Math.floor(pokemon.currentHP * 100 / getBaseStat(pokemon.pokemonId, 'hp'));

    return (
        <ProgressBar now={value} label={`${value}%`} variant={value < 20 ? 'danger' : (value < 50 ? 'warning' : 'success')} style={style}/>
    )
}
