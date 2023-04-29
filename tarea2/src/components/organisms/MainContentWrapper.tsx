import React from "react";
import axios from "axios";

import { IUser } from "../../models/IUser";
import { IAlbum } from "../../models/IAlbum";
import { IPhoto } from "../../models/IPhoto";
import { ListaAlbumes } from "../molecules/ListaAlbumes";
import { ListaUsuarios } from "../molecules/ListaUsuarios";
import { Album } from "../molecules/Album";
import { Foto } from "../molecules/Foto";

export const MainContentWrapper = () => {
    const [users, setUsers] = React.useState<IUser[]>([]);
    const [cargando, setCargando] = React.useState(true);
    const [selectedUser, setSelectedUser] = React.useState<IUser | undefined>();
    const [selectedAlbum, setSelectedAlbum] = React.useState<IAlbum | undefined>();
    const [selectedPhoto, setSelectedPhoto] = React.useState<IPhoto | undefined>();
    const [step, setStep] = React.useState(0);

    const traerColeccion = async () => {
        try{
            setCargando(true);
            const [users, albums, photos] = await Promise.all([
                axios.get("https://jsonplaceholder.typicode.com/users"),
                axios.get("https://jsonplaceholder.typicode.com/albums"),
                axios.get("https://jsonplaceholder.typicode.com/photos"),
            ]);

            const usuarios = (users.data as IUser[]).map((user) => {
                const userAlbums = (albums.data as IAlbum[]).filter((album) => album.userId === user.id);

                const userAlbumsWithPhotos = userAlbums.map((album) => {
                    const albumPhotos = (photos.data as IPhoto[]).filter((photo) => photo.albumId === album.id);

                    return {
                        ...album,
                        autor: user,
                        fotos: albumPhotos,
                    };
                });

                userAlbumsWithPhotos.forEach((album) => {
                    album.fotos.forEach((photo) => {
                        photo.album = album;
                    });
                });

                return {
                    ...user,
                    albums: userAlbumsWithPhotos,
                };
            });

            setUsers(usuarios);
            setCargando(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleNavBarClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        if(e.currentTarget.parentElement && e.currentTarget.parentElement.children){
            const moveToStep = Array.from(e.currentTarget.parentElement.children).indexOf(e.currentTarget);
            if(moveToStep < step) setStep(moveToStep);
        }
    };

    const renderNavBar = () => {
        return (
            <nav>
                <a href="#" onClick={(event) => handleNavBarClick(event)} className={step === 0 ? "loadedNav" : ""}>USERS</a> &#62;&nbsp;
                {(step > 0) ? <><a href="#" onClick={(event) => handleNavBarClick(event)} className={step === 1 ? "loadedNav" : ""}>ALBUMS BY: {selectedUser?.name}</a> {'>'} </> : <></>}
                {(step > 1) ? <><a href="#" onClick={(event) => handleNavBarClick(event)} className={step === 2 ? "loadedNav" : ""}>ALBUM: {selectedAlbum?.title}</a> {'>'} </> : <></>}
                {(step > 2) ? <><a href="#" className={step === 3 ? "loadedNav" : ""}>PHOTO: {selectedPhoto?.title}</a></> : <></>}
            </nav>
        )
    }

    /// DUDA: diferencia entre pasar arrow function y useCallBack como prop?
    /// DUDA: que utilidad tiene el arreglo de dependencias de useCallback?
    
    const selectUsuarioCB = React.useCallback((usuario: IUser) => {
        //console.log(usuario);
        setSelectedUser(usuario);
        setStep(1);
    }, [setStep]);

    const selectUsuario = (usuario: IUser) => {
        //console.log(usuario);
        setSelectedUser(usuario);
        setStep(1);
    };

    const selectAlbum = (album: IAlbum) => {
        //console.log(album);
        setSelectedAlbum(album);
        setStep(2);
    };

    const selectFoto = (foto: IPhoto) => {
        //console.log(foto);
        setSelectedPhoto(foto);
        setStep(3);
    };

    React.useEffect(() => {
        traerColeccion();
        console.log('data was loaded');
    }, []);
    
    /// DUDA: el render se hace despues de cualquier setState? porque esto no parece necesario
    //React.useEffect(() => {console.log('step was updated')}, [step]);

    if(cargando) return <>
        {renderNavBar()}
        <p>Loading ...</p>
    </>;

    if(step === 0) return <>
        {renderNavBar()}
        <label>Click a User:</label>
        <ListaUsuarios usuarios={users} selectUsuario={selectUsuario}/>
    </>

    if(step === 1) return <>
        {renderNavBar()}
        <label>Click an Album:</label>
        {selectedUser && selectedUser.albums ? <ListaAlbumes albumes={selectedUser.albums} selectAlbum={selectAlbum}/> : <></>}
    </>

    if(step === 2) return <>
        {renderNavBar()}
        {selectedAlbum ? <Album album={selectedAlbum} selectFoto={selectFoto}/> : <></>}
        
    </>

    return <>
        {renderNavBar()}
        {selectedPhoto ? <Foto foto={selectedPhoto}/> : <></>}
    </>
}