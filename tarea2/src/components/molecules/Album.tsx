import React from 'react'
import { IAlbum } from '../../models/IAlbum';
import { IPhoto } from '../../models/IPhoto';
import { Foto } from './Foto';

interface IAlbumProps {
    album: IAlbum;
    display?: string;
    selectFoto?: (foto: IPhoto) => void;
}

export const Album: React.FC<IAlbumProps> = ({album, display, selectFoto}) => {
    const renderFotos = () => {
        if(!album.fotos || album.fotos.length === 0){
            return null;
        }

        return (
            <>
                <label>Click a Photo:</label>
                <ul>
                    {album.fotos.map((foto) => {
                        return (
                            <a key={`${album.id}-${foto.id}`} onClick={e => {selectFoto? selectFoto(foto) : console.log()}}>
                                <Foto foto={foto} display="list"/>
                            </a>
                        )
                    })}
                </ul>
            </>
        );
    }

    if(display === "list") return (
        <>
            <li className='colection-item'>
                <p>#{album.id}</p>
                <p className='impact'>{album.title}</p>
            </li>
        </>
    )

    return (
        <>
            <h2>{album.title} <small>( #{album.id} )</small></h2>
            <p>Created by: {album.autor?.name}</p>
            
            {renderFotos()}
        </>
    )
}; 
