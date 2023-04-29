import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useFirebaseAuth } from "../../contexts/FirebaseAuthContext";
import { useNavigate } from "react-router-dom";
import { Button, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import CSS from 'csstype';

interface ILoginFormValues {
    email: string;
    password: string;
}

const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email("Correo inválido")
        .required("Campo requerido")
        //.matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
        .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
    password: Yup.string()
        .required("Campo requerido")
        .min(8, "Mínimo 8 caracteres"),
});

export const LoginForm = () => {
    const { login } = useFirebaseAuth();
    const navigate = useNavigate();

    const onSubmit = async (values: ILoginFormValues) => {
        await login(values.email, values.password);
        navigate("/");
    };

    return (
        <Row>
            <Col xs={4}></Col>
            <Col xs={4}>
                <h1 className="textAlignCenter">Login</h1>
                <Formik<ILoginFormValues>
                    initialValues={{
                        email: "",
                        password: "",
                    }}
                    validationSchema={LoginSchema}
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

                            <p className="textAlignCenter">Log in or <a href="/signup">create a free account</a></p>

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

                            <p className="textAlignRight"><small><a href="#">Forgot password?</a></small></p>

                            <Button
                                style={{width: '100%'} as CSS.Properties}
                                /*loading={isSubmitting || isValidating}*/
                                type="submit"
                                size="lg"
                                disabled={!isValid || isValidating}
                                variant={(!isValid || isValidating)? "secondary": "primary"}
                            >
                                Log in
                            </Button>

                        </Form>
                    )}
                </Formik>
            </Col>
            <Col xs={4}></Col>
        </Row>
    );
};