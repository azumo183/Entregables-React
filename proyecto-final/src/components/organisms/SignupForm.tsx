import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useFirebaseAuth } from "../../contexts/FirebaseAuthContext";
import { useNavigate } from "react-router-dom";
import { Button, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import CSS from 'csstype';

interface ISignupFormValues {
    email: string;
    password: string;
}

const SignupSchema = Yup.object().shape({
    email: Yup.string()
        .email("Correo inválido")
        .required("Campo requerido")
        .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
    password: Yup.string()
        .required("Campo requerido")
        .min(8, "Mínimo 8 caracteres"),
});

export const SignupForm = () => {
    const { signup } = useFirebaseAuth();
    const navigate = useNavigate();

    const onSubmit = async (values: ISignupFormValues) => {
        await signup(values.email, values.password);
        navigate("/");
    };

    return (
        <Row>
            <Col xs={4}></Col>
            <Col xs={4}>
                <h1 className="textAlignCenter">Sign Up</h1>
                <Formik<ISignupFormValues>
                    initialValues={{
                        email: "",
                        password: "",
                    }}
                    validationSchema={SignupSchema}
                    enableReinitialize={true}
                    onSubmit={onSubmit}
                    validateOnBlur
                    validateOnChange
                    validateOnMount
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                        isValid,
                        isValidating,
                    }) => (
                        <Form onSubmit={handleSubmit} className="loginForm">
                            
                            <p className="textAlignCenter">Create a free account or <a href="/login">log in</a></p>

                            <FloatingLabel label="Email">
                                <Form.Control
                                    id="email"
                                    type="email"
                                    //defaultValue={values.email}
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    /*error={touched.email && !!errors.email}
                                    helperText={touched.email && errors.email}*/
                                    required
                                />
                            </FloatingLabel>

                            <FloatingLabel label="Password">
                                <Form.Control
                                    id="password"
                                    type="password"
                                    //defaultValue={values.password}
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    /*error={touched.password && !!errors.password}
                                    helperText={touched.password && errors.password}*/
                                    required
                                />
                            </FloatingLabel>

                            <Button
                                style={{width: '100%'} as CSS.Properties}
                                /*loading={isSubmitting || isValidating}*/
                                type="submit"
                                size="lg"
                                disabled={!isValid || isValidating}
                                variant={(!isValid || isValidating)? "secondary": "primary"}
                            >
                                Sign Up
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Col>
            <Col xs={4}></Col>
        </Row>
    );
};