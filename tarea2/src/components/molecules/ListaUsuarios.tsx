import React, { DOMElement } from "react";
import { IUser } from "../../models/IUser";
import { Usuario } from "./Usuario";

export interface IListaUsuariosProps {
    usuarios: IUser[];
    selectUsuario: (usuario: IUser) => void;
}

export const ListaUsuarios: React.FC<IListaUsuariosProps> = ({usuarios, selectUsuario}) => {
    
    return <ul>
        {usuarios.map((usuario) => (
            <a key={usuario.id} href="#" onClick={e => {selectUsuario(usuario)}} data-userid={usuario.id}>
                <Usuario usuario={usuario}/>
            </a>
        ))}
    </ul>
};