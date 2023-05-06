import React from 'react'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { useFirebaseUsersContext } from '../../contexts/FirebaseUsersContext';
import { SpinnerCustom } from './SpinnerCustom';
import { NavDropdown, Navbar } from 'react-bootstrap';
import { DoorClosed, Person } from 'react-bootstrap-icons';

export const LoggedInAs = () => {
    const [ displayName, setDisplayName ] = React.useState<string>();

    const { authUser, loadingAuthUser } = useFirebaseAuth();
    const { users, getUserDisplayName } = useFirebaseUsersContext();
    const { logout } = useFirebaseAuth();

    const loadDisplayName = React.useCallback(() => {
        if(!authUser || users.length === 0) return;

        const userDisplayName = getUserDisplayName(authUser.uid);
        if(userDisplayName) setDisplayName(userDisplayName);
        else if(authUser.email) setDisplayName(authUser.email);
        else setDisplayName('n/a');
    }, [authUser, getUserDisplayName, users]);

    const spinner = <SpinnerCustom variant='light'/>

    React.useEffect(() => {
        loadDisplayName();
    }, [loadDisplayName]);

    if(loadingAuthUser) return spinner;

    if(!authUser) return (
        <Navbar.Text>
            <a href="/login">Log in</a> | <a href="/signup">Sign Up</a>
        </Navbar.Text>
    )

    if(!displayName) return spinner;

    return (
        <>
            <Navbar.Text>Logged in as:</Navbar.Text>
            
            <NavDropdown title={displayName} style={{color: 'white', marginLeft: '6px'}}>
                <NavDropdown.Item style={{color: 'gray'}} href='/account'><Person/> My Account</NavDropdown.Item>
                <NavDropdown.Item style={{color: 'gray'}} onClick={logout} href='/'><DoorClosed/> Log Out</NavDropdown.Item>
            </NavDropdown>
        </>
        
    )
}
