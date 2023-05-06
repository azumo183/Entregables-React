import React from 'react'
import { Spinner } from "react-bootstrap";

interface ISpinnerCustom {
    as?: string;
    variant?: string;
    text?: string;
}

const DEFAULT_VARIANT = 'dark';
const DEFAULT_TEXT = 'Loading ...';

export const SpinnerCustom: React.FC<ISpinnerCustom> = ({as, variant, text}) => {

    if(as === 'span') return (
        <>
            <Spinner as="span" animation="border" size="sm" role="status" variant={variant? variant : DEFAULT_VARIANT} aria-hidden="true"/>
            <span className="visually-hidden">{text? text : DEFAULT_TEXT}</span>
        </>
    )

    return (
        <Spinner animation="border" size="sm" role="status" variant={variant? variant : DEFAULT_VARIANT} >
            <span className="visually-hidden">{text? text : DEFAULT_TEXT}</span>
        </Spinner>
    )
}
