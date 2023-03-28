import React from 'react'
import { IPhoto } from '../../models/IPhoto';

interface IPhotoProps {
    foto: IPhoto;
    display?: string;
}

export const Foto: React.FC<IPhotoProps> = ({foto, display}) => {
  if(display === 'list') return (
    <li className='colection-item'>
        <p>#{foto.id}</p>
        <div className='tooltip'>
          <img src={foto.thumbnailUrl} alt={`${foto.title}'s thumbnail`}/>
          <span className='tooltiptext'>{foto.title}</span>
        </div>
    </li>
  )

  return (
    <>
      <h2>{foto.title} <small>( #{foto.id} )</small></h2>
      <p>From album: {foto.album?.title} <small>( #{foto.album?.id} )</small></p>
      <p>Created by: {foto.album?.autor?.name}</p>
      <div className='image-container'>
        <img src={foto.url} alt={foto.title}/>
      </div>
    </>
  )
}
