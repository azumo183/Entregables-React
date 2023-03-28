import { IAlbum } from "./IAlbum";

export interface IPhoto {
    albumId: number;
    id: number;
    title: string;
    url: string;
    thumbnailUrl: string;
    album?: IAlbum; 
}