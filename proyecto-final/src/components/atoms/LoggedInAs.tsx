import React from 'react'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';

export const LoggedInAs = () => {
    const { authUser } = useFirebaseAuth();

    if(!authUser) return <><a href="/login">Log in</a> | <a href="/signup">Sign Up</a></>

    return (
        <>Logged in as: <a href="#profile">{authUser.email}</a></>
    )
}
