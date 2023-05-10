import React from 'react'
import { IMove } from '../../models/IMove';
import { Button } from 'react-bootstrap';
import { TypeTag } from './TypeTag';
import { callApi, formatedMove } from '../../util';
import { Trash3 } from 'react-bootstrap-icons';
import { SpinnerCustom } from './SpinnerCustom';
import { useTeambuilderContext } from '../../contexts/TeambuilderContext';
import { IPokemon } from '../../models/IPokemon';

interface IMoveProps {
    moveId: number;
    pokemon: IPokemon;
}

export const Move: React.FC<IMoveProps> = ({pokemon, moveId}) => {
    const [move, setMove] = React.useState<IMove>();

    const { setShowModal, setSelectedPokemon, setSelectedMove } = useTeambuilderContext();

    const loadMove = React.useCallback(async () => {
        try {
            const response = await callApi([`https://pokeapi.co/api/v2/move/${moveId}`]);
            const moves: IMove[] = [];
            response.forEach(element => moves.push(element.data as IMove));
            setMove(moves[0]);
            console.log(`Move: ${formatedMove(moves[0].name)} loaded from api!`);
        } catch (error) {
            console.error(error);
        }
    }, [moveId]);

    const handleMoveDelete = (move: IMove) => {
        setSelectedPokemon(pokemon);
        setSelectedMove(move);
        setShowModal('del_move');
    };

    React.useEffect(() => {
        loadMove();
    }, [loadMove]);
    
    if(!move) return <SpinnerCustom/>

    return (
        <>
            <Button variant='link' style={{color: 'gray', float: 'right'}} onClick={() => handleMoveDelete(move)}><Trash3/></Button>
            <span>{formatedMove(move.name)}</span>
            <span>
                <TypeTag typeName={move.type.name}/>
                <TypeTag typeName={move.damage_class.name} variant='category'/>
            </span>
            <br/>
            <span>{`Pow: ${move.power? move.power: '-'}`}</span>
            <span>{`Acc: ${move.accuracy? move.accuracy: '-'}`}</span>
            <span>{`PP: ${move.pp}`}</span>
        </>
    )
}
