import React from 'react'
import { IUser } from '../../models/IUser';

interface IUsuarioProps {
    usuario: IUser;
}

export const Usuario: React.FC<IUsuarioProps> = ({usuario}) => {
    return (
        <li className='colection-item'>
            <p>#{usuario.id}</p>
            <p className='impact'>{usuario.name}</p>
            <p>[ {usuario.username} ]</p>
        </li>
    )
}; 
