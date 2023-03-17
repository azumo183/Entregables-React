import logo from './logo.svg';
import './App.css';

import React from "react";
import Pokedex from 'pokedex-promise-v2';
import { ListaPokemon } from './ListaPokemon';
import { ListaPokemonClass } from './ListaPokemonClass';

const P = new Pokedex();
const DreamTeam = ['charizard', 'butterfree', 'pidgeot', 'nidoking', 'golduck', 'scyther'];

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1><img src={logo} className="App-logo" alt="logo" />Aarón's Childhood Dream Team<img src={logo} className="App-logo" alt="logo" /></h1>
      </header>
      <main>
        <ListaPokemon listaPokemon={P.getPokemonByName(DreamTeam.slice(0, 3))}/>
        <ListaPokemonClass listaPokemon={P.getPokemonByName(DreamTeam.slice(3))}/>
      </main>
      <footer>
        <p>Developed by: Aarón Zúñiga Morales</p>
      </footer>
    </div>
  );
}

export default App;