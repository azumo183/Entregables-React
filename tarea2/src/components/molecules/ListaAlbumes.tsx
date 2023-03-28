import React from "react";
import { IAlbum } from "../../models/IAlbum";
import { Album } from "./Album";

export interface IListaAlbumesProps {
    albumes: IAlbum[];
    selectAlbum: (album: IAlbum) => void;
}

export const ListaAlbumes: React.FC<IListaAlbumesProps> = ({albumes, selectAlbum}) => {

    return <ul>
        {albumes.map((album) => (
            <a key={album.id} href="#" onClick={e => {selectAlbum(album)}}>
                <Album album={album} display="list"/>
            </a>
        ))}
    </ul>
};