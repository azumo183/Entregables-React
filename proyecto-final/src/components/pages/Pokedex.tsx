import React from 'react'
import { IPokemon } from '../../models/IPokemon';
import { usePokedexContext } from '../../contexts/PokedexContext';
import { Filter } from '../molecules/Filter';
import { Col, Row } from 'react-bootstrap';
import { Pokemon } from '../molecules/Pokemon';
import { devlog } from '../../util';
import { SpinnerCustom } from '../atoms/SpinnerCustom';

interface IFilter {
    search: string;
    type1: number;
    type2: number;
}

interface IPokedexProps {
    variant?: string;
}

export const Pokedex: React.FC<IPokedexProps> = ({variant}) => {
    const { pokedex, loading } = usePokedexContext();
    const [ filteredPokedex, setFilteredPokedex ] = React.useState<IPokemon[]>([]);
    const [ filter, setFilter ] = React.useState<IFilter>({search: "", type1: 0, type2: 0});

    const types: string[] = React.useMemo(() => {
        if(loading)  return [];
        devlog(`Pokedex: building options for type filters ...`)

        const newTypes: string[] = [];
        pokedex.forEach(pokemon => {
            pokemon.types.forEach(type => {
                if(newTypes.indexOf(type.type.name) < 0) newTypes.push(type.type.name);
            });
        });
        return ['- Any -', ...newTypes.sort()];
    }, [loading, pokedex]);

    const filterPokedex = React.useCallback((filter: IFilter) => {
        if(loading) return;
        devlog(`Pokedex: applying filters to pokedex ...`)

        let newFilteredPokedex = pokedex;

        if(!Number.isNaN(Number.parseInt(filter.search))) newFilteredPokedex =  newFilteredPokedex.filter(pokemon => pokemon.id === Number.parseInt(filter.search));
        else newFilteredPokedex = newFilteredPokedex.filter(pokemon => pokemon.name.toLowerCase().indexOf(filter.search.toLowerCase()) >= 0);

        if(filter.type1 !== 0){
            newFilteredPokedex = newFilteredPokedex.filter(pokemon =>
                pokemon.types.filter(type => type.type.name === types[filter.type1]).length > 0
            );
        }

        if(filter.type2 !== 0){
            newFilteredPokedex = newFilteredPokedex.filter(pokemon =>
                pokemon.types.filter(type => type.type.name === types[filter.type2]).length > 0
            );
        }

        setFilteredPokedex(newFilteredPokedex);
    }, [pokedex, loading, types]);

    React.useEffect(() => {
        filterPokedex(filter);
    }, [filterPokedex, filter]);

    const handleFilterUpdate = (value: string) => {
        setFilter({...filter, search: value});
    };

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>, slot: number) => {
        const newFilter = {...filter};
        if(slot === 1) newFilter.type1 = Number.parseInt(e.currentTarget.value);
        else newFilter.type2 = Number.parseInt(e.currentTarget.value);
        setFilter(newFilter);
    };

    if(loading) return <SpinnerCustom/>

    return (
        <>
            {variant && variant === 'pick' ? <p className='boldText'>Please select the pokémon you want to add to your team:</p> : <h1>Pokédex</h1>}

            <Filter 
                input={{label: 'Pokémon ID or Name', handleUpdate: handleFilterUpdate}}
                select1={{label: 'Type 1', options: types, handle: handleSelect}}
                select2={{label: 'Type 2', options: types, handle: handleSelect}}
            />

            <Row className='myTableHeader'>
                <Col>ID ↑</Col>
                <Col>Icon</Col>
                <Col>Name</Col>
                <Col>Type(s)</Col>
                <Col>HP</Col>
                <Col>Attack</Col>
                <Col>Defense</Col>
                <Col>Special Attack</Col>
                <Col>Special Defense</Col>
                <Col>Speed</Col>
            </Row>
            {
                filteredPokedex.length > 0 ? (
                    filteredPokedex.map( pokemon =>
                        <Pokemon key={pokemon.id} pokemon={pokemon} variant={`pokedex`}/>
                    )
                ) : <p className='textAlignCenter' style={{marginTop:'20px'}}>No matching data found</p>
            }
        </>
    )
}
