import React from 'react'
import { Accordion, Row, Col, FloatingLabel, Form } from 'react-bootstrap'
import { capFirst } from '../../util';

interface IFilterProps {
    input: IFilterInput;
    select1?: IFilterSelect;
    select2?: IFilterSelect;

    variant?: string;
}

interface IFilterInput {
    label: string;
    handleEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement, Element>) => void;
}

interface IFilterSelect {
    label: string;
    options: string[];
    handle: (e: React.ChangeEvent<HTMLSelectElement>, slot: number) => void;
}

export const Filter: React.FC<IFilterProps> = ({input, select1, select2, variant}) => {
    return (
        <Accordion>
            <Accordion.Item eventKey="0">
                <Accordion.Header>Filter</Accordion.Header>
                <Accordion.Body>
                    <Row>
                        <Col sm={variant && variant === 'text-only' ? 12 : 6}>
                            <FloatingLabel label={input.label}>
                                <Form.Control type="text" onKeyDown={input.handleEnter} onBlur={input.handleBlur}/>
                            </FloatingLabel>
                        </Col>
                        {variant && variant === 'text-only' ? <></>: (
                            <>
                                {select1? (
                                    <Col sm={3}>
                                        <FloatingLabel label={select1.label}>
                                            <Form.Select onChange={e => select1.handle(e, 1)}>
                                                {select1.options.map((option, index) => <option key={option} value={index}>{capFirst(option)}</option>)}
                                            </Form.Select>
                                        </FloatingLabel>
                                    </Col>
                                ) : <></>}
                                
                                {select2? (
                                    <Col sm={3}>
                                    <FloatingLabel label={select2.label}>
                                        <Form.Select onChange={e => select2.handle(e, 2)}>
                                            {select2.options.map((option, index) => <option key={option} value={index}>{capFirst(option)}</option>)}
                                        </Form.Select>
                                    </FloatingLabel>
                                </Col>
                                ) : <></>}
                            </>
                        )}
                    </Row>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    )
}
