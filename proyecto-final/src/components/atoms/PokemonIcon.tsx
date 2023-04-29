import React from 'react'
import CSS from 'csstype';
import iconSheet from '../../resources/pokemonicons-sheet.png';

interface IPokemonIconProps {
    pokemonId: number;
}

export const PokemonIcon: React.FC<IPokemonIconProps> = ({pokemonId}) => {

    const iconPosition = {
        x: (pokemonId % 12) * 40,
        y: Math.floor(pokemonId / 12) * 30,
    };

    const iconStyle: CSS.Properties = {
        background: `transparent url(${iconSheet}) no-repeat scroll -${iconPosition.x}px -${iconPosition.y}px`,
        display: 'inline-block',
    };
  
    return (
        <span className='pokeicon' style={iconStyle}/>
    )
}
