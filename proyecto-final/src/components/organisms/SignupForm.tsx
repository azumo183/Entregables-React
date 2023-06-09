import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useFirebaseAuth } from "../../contexts/FirebaseAuthContext";
import { useNavigate } from "react-router-dom";
import { Button, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import { useFirebaseUsersContext } from "../../contexts/FirebaseUsersContext";
import { getAuth } from "firebase/auth";
import { setUser } from "../../services/firebase-users";
import { SpinnerCustom } from "../atoms/SpinnerCustom";

const REQUIRED_FIELD_MESSAGE = "This information is required.";
const INVALID_EMAIL_MESSAGE = "This is not a valid email format.";
const MIN_PASSWORD_LENGTH_MESSAGE = "This must be at least 8 characters long.";
const UNMATCHING_PASSWORDS_MESSAGE = "This does not match your password.";
const REPEATED_DISPLAYNAME_MESSAGE = "This display name is already taken.";

interface ISignupFormValues {
    email: string;
    password: string;
    repeatPassword: string;
    displayName: string;
}

export const SignupForm = () => {
    const { users } = useFirebaseUsersContext();
    const { signup } = useFirebaseAuth();
    const navigate = useNavigate();

    const SignupSchema = Yup.object().shape({
        email: Yup.string()
            .email(INVALID_EMAIL_MESSAGE)
            .required(REQUIRED_FIELD_MESSAGE)
            .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, INVALID_EMAIL_MESSAGE),
        password: Yup.string()
            .required(REQUIRED_FIELD_MESSAGE)
            .min(8, MIN_PASSWORD_LENGTH_MESSAGE),
        repeatPassword: Yup.string()
            .required(REQUIRED_FIELD_MESSAGE)
            .oneOf([Yup.ref('password')], UNMATCHING_PASSWORDS_MESSAGE),
        displayName: Yup.string()
            .trim()
            .required(REQUIRED_FIELD_MESSAGE)
            .notOneOf(users.map(user => user.data.displayName), REPEATED_DISPLAYNAME_MESSAGE),
    });

    const onSubmit = async (values: ISignupFormValues) => {
        const correct = await signup(values.email, values.password);
        if(correct){
            const authUser = getAuth().currentUser;
            if(authUser){
                await setUser(authUser, values.displayName);
                navigate("/");
            }
        }
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
                        repeatPassword: "",
                        displayName: "",
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

                            <FloatingLabel label="Display Name">
                                <Form.Control
                                    id="displayName"
                                    type="text"
                                    value={values.displayName.trim()}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isValid={touched.displayName && !errors.displayName}
                                    isInvalid={touched.displayName && !!errors.displayName}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{errors.displayName}</Form.Control.Feedback>
                            </FloatingLabel>
                            {/* {touched.displayName && !!errors.displayName? <Form.Text style={{color: 'crimson'}}>{errors.displayName}</Form.Text> : <></>} */}

                            <FloatingLabel label="Email">
                                <Form.Control
                                    id="email"
                                    type="email"
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isValid={touched.email && !errors.email}
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
                                    isValid={touched.password && !errors.password}
                                    isInvalid={touched.password && !!errors.password}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                            </FloatingLabel>

                            <FloatingLabel label="Confirm Password">
                                <Form.Control
                                    id="repeatPassword"
                                    type="password"
                                    value={values.repeatPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isValid={touched.repeatPassword && !errors.repeatPassword}
                                    isInvalid={touched.repeatPassword && !!errors.repeatPassword}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{errors.repeatPassword}</Form.Control.Feedback>
                            </FloatingLabel>

                            <Button
                                style={{width: '100%'}}
                                type="submit"
                                size="lg"
                                disabled={!isValid || isValidating}
                            >
                                {isSubmitting || isValidating?
                                    <SpinnerCustom as="span" variant="light"/>:
                                    'Sign Up'
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