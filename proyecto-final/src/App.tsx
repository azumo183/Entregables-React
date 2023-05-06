import React from 'react';
//import logo from './logo.svg';
import './App.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Pokedex } from './components/pages/Pokedex';
import { PokedexContextProvider } from './contexts/PokedexContext';
import { PokemonWrapper } from './components/organisms/PokemonWrapper';
import { Nav, Navbar, Container } from 'react-bootstrap';
import { TeamsList} from './components/pages/TeamsList';
import { Teambuilder } from './components/pages/Teambuilder';
import { FirebaseContextProvider } from './contexts/FirebaseContext';
import { FirebaseAuthContextProvider } from './contexts/FirebaseAuthContext';
import { AuthPage } from './components/layout/AuthPage';
import { SignupForm } from './components/organisms/SignupForm';
import { LoginForm } from './components/organisms/LoginForm';
import { LoggedInAs } from './components/atoms/LoggedInAs';
import { TeambuilderContextProvider } from './contexts/TeambuilderContext';
import { BattleHub } from './components/pages/BattleHub';
import { Battle } from './components/pages/Battle';
import { FirebaseUsersContextProvider } from './contexts/FirebaseUsersContext';
import { AccountForm } from './components/organisms/AccountForm';
import { ProtectedPage } from './components/layout/ProtectedPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <BattleHub/>,
  },
  {
    path: "/:battleId",
    element: <Battle/>,
  },
  {
    path: "/pokedex",
    element: <Pokedex/>,
  },
  {
    path: "/pokedex/:pokemonId",
    element: <PokemonWrapper/>,
  },
  {
    path: "/signup",
    element: (
      <AuthPage>
        <SignupForm />
      </AuthPage>
    ),
  },
  {
    path: "/login",
    element: (
      <AuthPage>
        <LoginForm />
      </AuthPage>
    ),
  },
  {
    path: "/teambuilder",
    element: <TeamsList/>,
  },
  {
    path: "/teambuilder/:teamId",
    element: (
      <ProtectedPage>
        <TeambuilderContextProvider>
          <Teambuilder/>
        </TeambuilderContextProvider>
      </ProtectedPage>
    ),
  },
  {
    path: "/account",
    element: (
      <ProtectedPage>
        <AccountForm/>
      </ProtectedPage>
    ),
  },
]);

function App() {
  return (
    <>
      {/*<div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>*/}

      <FirebaseContextProvider>
        <FirebaseAuthContextProvider>
          <FirebaseUsersContextProvider>
            <header>
              <Navbar bg='dark' variant='dark'>
                <Container>
                  <Navbar.Brand href="/">Pokémon Showdown Rip-Off ‼</Navbar.Brand>
                  <Navbar.Toggle aria-controls="basic-navbar-nav" />
                  <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className='me-auto'>
                      <Nav.Link href="/pokedex">Pokédex</Nav.Link>
                      <Nav.Link href="/teambuilder">Teambuilder</Nav.Link>
                    </Nav>
                  </Navbar.Collapse>
                  <Navbar.Collapse className="justify-content-end">
                    <LoggedInAs/>
                  </Navbar.Collapse>
                </Container>
              </Navbar>
            </header>

            <main>            
              <Container id='mainContainer'>
                <PokedexContextProvider>
                  <RouterProvider router={router} />
                </PokedexContextProvider>
              </Container>
            </main>
          </FirebaseUsersContextProvider>
        </FirebaseAuthContextProvider>
      </FirebaseContextProvider>

      <footer>
        <p className='noMargin'>Developed by : Aarón Zúñiga Morales | 2023</p>
      </footer>

    </>
  );
}

export default App;
