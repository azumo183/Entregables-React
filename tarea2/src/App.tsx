import React from 'react';
import logo from './logo.svg';
import './App.css';
import { MainContentWrapper } from './components/organisms/MainContentWrapper';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1><img src={logo} className="App-logo" alt="logo" />Placeholder Gallery<img src={logo} className="App-logo" alt="logo" /></h1>
      </header>
      <main>
        <MainContentWrapper/>
      </main>
      <footer>
        <p>Developed by: Aarón Zúñiga Morales</p>
      </footer>
    </div>
  );
}

export default App;
