import React from 'react'
import { Filter } from './Filter'
import { Card, Col, Row } from 'react-bootstrap'
import { TypeTag } from '../atoms/TypeTag'
import { callApi, formatedMove } from '../../util';
import { IMove } from '../../models/IMove';
import { IPokemon } from '../../models/IPokemon';
import { useTeambuilderContext } from '../../contexts/TeambuilderContext';
import { SpinnerCustom } from '../atoms/SpinnerCustom';

interface IMovesProps {
    pokemon: IPokemon;
}

interface IFilter {
    search: string;
    type: number;
    category: number;
}

interface IMoveTypes {
    types: string[];
    categories: string[];
}

export const Moves: React.FC<IMovesProps> = ({pokemon}) => {
    const [ loadingMoves, setLoadingMoves ] = React.useState<boolean>(true);
    const [ filteredMoves, setFilteredMoves ] = React.useState<IMove[]>([]);
    const [ filter, setFilter ] = React.useState<IFilter>({search: "", type: 0, category: 0});

    const {handleAddMove } = useTeambuilderContext();

    const typesAndCats: IMoveTypes = React.useMemo(() => {
        if(!pokemon.movesDetailed)  return {types: [], categories: []};
        console.log(`Moves: building options for type filters ...`)

        const newTypes: string[] = [];
        const newCategories: string[] = [];
        if(pokemon.movesDetailed) pokemon.movesDetailed.forEach(move => {
            if(newTypes.indexOf(move.type.name) < 0) newTypes.push(move.type.name);
            if(newCategories.indexOf(move.damage_class.name) < 0) newCategories.push(move.damage_class.name);
        });
        return {types: ['- Any -', ...newTypes.sort()], categories: ['- Any -', ...newCategories.sort()]};
    }, [pokemon.movesDetailed]);

    const loadMoves = React.useCallback(async () => {
        if(pokemon.movesDetailed) {
            console.log(`Moves: ${pokemon.movesDetailed.length} detailed move(s) found, no need to load from api ...`)
            setLoadingMoves(false);
            return;
        }
        console.log(`Moves: loading ${pokemon.name} moves from api ...`);

        setLoadingMoves(true);
        try {
            const response = await callApi(pokemon.moves.map(move => move.move.url));
            const moves: IMove[] = [];
            response.forEach(element => moves.push(element.data as IMove));

            pokemon.movesDetailed = moves.sort((a , b) => {
                if(a.name >= b.name) return 1;
                else return -1;
            });
            console.log(`Moves: ${pokemon.movesDetailed.length} detailed move(s) loaded from api!`);
        } catch (error) {
            console.error(error);
        }
        setLoadingMoves(false);
    }, [pokemon]);
    
    const filterMoves = React.useCallback((filter: IFilter) => {
        if(!pokemon.movesDetailed){
            setFilteredMoves([]);
            return;
        }
        console.log(`Moves: applying filters to ${pokemon.name} moves ...`);

        let newFilteredMoves = pokemon.movesDetailed.filter(move => move.name.toLowerCase().indexOf(filter.search.toLowerCase()) >= 0);
        if(filter.type !== 0) newFilteredMoves = newFilteredMoves.filter(move => move.type.name === typesAndCats.types[filter.type]);
        if(filter.category !== 0) newFilteredMoves = newFilteredMoves.filter(move => move.damage_class.name === typesAndCats.categories[filter.category]);

        if(pokemon.partyPokemon && pokemon.partyPokemon.selectedMoves.length > 0){
            pokemon.partyPokemon.selectedMoves.forEach(selectedMove => {
                newFilteredMoves = newFilteredMoves.filter(move => move.id !== selectedMove.moveId);
            });
        }

        setFilteredMoves(newFilteredMoves);
    }, [pokemon, typesAndCats]);

    React.useEffect(() => {
        loadMoves();
    }, [loadMoves]);

    React.useEffect(() => {
        filterMoves(filter);
    }, [filterMoves, filter]);

    const handleUpdate = (value: string) => {
        setFilter({...filter, search: value});
    };

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>, slot: number) => {
        const newFilter = {...filter};
        if(slot === 1) newFilter.type = Number.parseInt(e.currentTarget.value);
        else newFilter.category = Number.parseInt(e.currentTarget.value);
        setFilter(newFilter);
    };

    return (
        <>
            <Filter
                input={{label: 'Move Name', handleUpdate: handleUpdate}}
                select1={{label: 'Move Type', options: typesAndCats.types, handle: handleSelect}}
                select2={{label: 'Move Category', options: typesAndCats.categories, handle: handleSelect}}
            />

            <Row>
                <Col>
                    <Card className='sm-card'>
                        <Card.Header>Moves:</Card.Header>
                        <Card.Body className='moveList'>
                            {loadingMoves? <SpinnerCustom/> : (
                                filteredMoves.length > 0?
                                <>
                                    <Row style={{fontWeight: 'bold', marginBottom: '8px'}}>
                                        <Col>Name ↑</Col>
                                        <Col xs={6} className='textAlignLeft'>Description</Col>
                                        <Col>Type</Col>
                                        <Col>Power</Col>
                                        <Col>Accuracy</Col>
                                        <Col>PP</Col>
                                    </Row>
                                    {filteredMoves.map(move => (
                                        <button key={move.id} className='link smallText' onClick={() => handleAddMove(move)}>
                                            <Row>
                                                <Col>{`${formatedMove(move.name)}`}</Col>
                                                <Col xs={6} className='textAlignLeft'>
                                                    {`${move.flavor_text_entries.filter(text => text.language.name === 'en').length > 0 ? move.flavor_text_entries.filter(text => text.language.name === 'en')[0].flavor_text : "ERROR 404: No description available"}`}
                                                </Col>
                                                <Col>
                                                    <TypeTag typeName={move.type.name}/>
                                                    <TypeTag typeName={move.damage_class.name} variant='category'/>
                                                </Col>
                                                <Col>{move.power? move.power : '-'}</Col>
                                                <Col>{move.accuracy? move.accuracy : '-'}</Col>
                                                <Col>{move.pp}</Col>
                                            </Row>
                                        </button>
                                    ))}
                                </> : <p>No matching data found</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    )
}
