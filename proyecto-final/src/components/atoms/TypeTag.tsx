import React from 'react'
import { capFirst } from '../../util';

interface ITypeTagProps {
    typeName?: string;
    variant?: string;
}

export const TypeTag: React.FC<ITypeTagProps> = ({typeName, variant}) => {
    if(!typeName) return <></>

    if(variant && variant === 'category') 
        return <img className='typeTag' src={`https://play.pokemonshowdown.com/sprites/categories/${capFirst(typeName)}.png`} alt={capFirst(typeName)}/>

    return <img className='typeTag' src={`https://play.pokemonshowdown.com/sprites/types/${capFirst(typeName)}.png`} alt={capFirst(typeName)} />
}
