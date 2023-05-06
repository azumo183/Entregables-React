import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useFirebaseAuth } from "../../contexts/FirebaseAuthContext";
import { useNavigate } from "react-router-dom";
import { Button, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import { SpinnerCustom } from "../atoms/SpinnerCustom";

const REQUIRED_FIELD_MESSAGE = "This information is required.";
const INVALID_EMAIL_MESSAGE = "This is not a valid email format.";
const MIN_PASSWORD_LENGTH_MESSAGE = "This must be at least 8 characters long.";

interface ILoginFormValues {
    email: string;
    password: string;
}

const LoginSchema = Yup.object().shape({
    email: Yup.string()
        .email(INVALID_EMAIL_MESSAGE)
        .required(REQUIRED_FIELD_MESSAGE)
        .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, INVALID_EMAIL_MESSAGE),
        //.matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
    password: Yup.string()
        .required(REQUIRED_FIELD_MESSAGE)
        .min(8, MIN_PASSWORD_LENGTH_MESSAGE),
});

export const LoginForm = () => {
    const { login, forgotPassword } = useFirebaseAuth();
    const navigate = useNavigate();

    const handleForgotPassword = async (email: string) => {
        await forgotPassword(email);
        alert(`Email sent to ${email}.\nProbably to spam folder ...`);
    };

    const onSubmit = async (values: ILoginFormValues) => {
        const correct = await login(values.email, values.password);
        if(correct) navigate("/");
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
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.email && !!errors.email}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                            </FloatingLabel>

                            <FloatingLabel label="Password">
                                <Form.Control
                                    id="password"
                                    type="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.password && !!errors.password}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                            </FloatingLabel>

                            <p className="textAlignRight"><Button size="sm" variant="link" onClick={() => !errors.email ? handleForgotPassword(values.email) : alert('Please type a valid email')}>Forgot password?</Button></p>

                            <Button
                                style={{width: '100%'}}
                                type="submit"
                                size="lg"
                                disabled={!isValid || isValidating}
                            >
                                {isSubmitting || isValidating?
                                    <SpinnerCustom as="span" variant="light"/>:
                                    'Log in'
                                }
                            </Button>

                        </Form>
                    )}
                </Formik>
            </Col>
            <Col xs={4}></Col>
        </Row>
    );
};