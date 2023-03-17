import React, { Component } from "react";
import capFirst from "./capitalize";

export class ListaPokemonClass extends Component{
    constructor(props){
        super(props);
        this.state = {
            lista: []
        };
    }

    componentDidMount(){
        const { listaPokemon } = this.props;
        listaPokemon.then(result => { this.setState({ lista: result }) });
    }

    render(){
        return (
            <React.Fragment>
                <div className="listContainer">
                        {this.state.lista.map((pokemon, i) => (
                            <div key={i}>
                                <h4>{`${capFirst(pokemon.name)}`}&nbsp;<small>{`(#${pokemon.id})`}</small></h4>
                                <p>{pokemon.types.map((tipo) => (
                                    (tipo.slot > 1 ? " / " : "") + capFirst(tipo.type.name)
                                ))}</p>
                                <img src={pokemon.sprites.other["official-artwork"].front_default} alt={`${capFirst(pokemon.name)}'s sprite`}/>
                            </div>
                        ))}
                </div>
                <small>(Rendered by ListaPokemonClass.js)</small>
            </React.Fragment>
        );
    }
}