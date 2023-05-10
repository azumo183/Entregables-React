import React from 'react'
import { usePokedexContext } from '../../contexts/PokedexContext';
import { Pokemon } from '../molecules/Pokemon';
import { useParams } from 'react-router-dom';
import { SpinnerCustom } from '../atoms/SpinnerCustom';

export const PokemonWrapper = () => {
    const { pokemonId } = useParams();
    const { pokedex, loading } = usePokedexContext();

    if(pokemonId === undefined || Number.isNaN(pokemonId) || Number.parseInt(pokemonId) < 1 || Number.parseInt(pokemonId) > 151) return <p>Error 404</p>
    if(loading) return <SpinnerCustom/>    
    
    const pokemon = pokedex.find(pokemon => pokemon.id === Number.parseInt(pokemonId));
    if(!pokemon) return <p>Error 404</p>;

    return <Pokemon pokemon={pokemon}/>;
}
