import React from 'react'
import capFirst from './capitalize';

export const ListaPokemon = ({ listaPokemon }) => {
    const [Lista, setLista] = React.useState([]);

    React.useEffect(() => {
        listaPokemon.then(result => { setLista(result) });
    }, []);

    return (
        <React.Fragment>
            <div className="listContainer">
                {Lista.map((pokemon, i) => (
                    <div key={i}>
                        <h4>{`${capFirst(pokemon.name)}`}&nbsp;<small>{`(#${pokemon.id})`}</small></h4>
                        <p>{pokemon.types.map((tipo) => (
                            (tipo.slot > 1 ? " / " : "") + capFirst(tipo.type.name)
                        ))}</p>
                        <img src={pokemon.sprites.other["official-artwork"].front_default} alt={`${capFirst(pokemon.name)}'s sprite`}/>
                    </div>
                ))}
            </div>
            <small>(Rendered by ListaPokemon.js)</small>
        </React.Fragment>
    )
}
