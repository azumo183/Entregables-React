import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useFirebaseAuth } from "../../contexts/FirebaseAuthContext";
import { Button, Col, FloatingLabel, Form, Row } from "react-bootstrap";
import { useFirebaseUsersContext } from "../../contexts/FirebaseUsersContext";
import { getAuth } from "firebase/auth";
import { setUser } from "../../services/firebase-users";
import { SpinnerCustom } from "../atoms/SpinnerCustom";

const REQUIRED_FIELD_MESSAGE = "This information is required.";
const INVALID_EMAIL_MESSAGE = "This is not a valid email format.";
const MIN_PASSWORD_LENGTH_MESSAGE = "This must be at least 8 characters long.";
const UNMATCHING_PASSWORDS_MESSAGE = "This does not match New Password.";
const REPEATED_DISPLAYNAME_MESSAGE = "This display name is already taken.";
const REPEATED_PASSWORD_MESSAGE = "This must NOT match Current Password.";

interface ISignupFormValues {
    email: string;
    password: string;
    newPassword: string;
    repeatPassword: string;
    displayName: string;
}

export const AccountForm= () => {
    const [saving, setSaving] = React.useState(0);

    const { users, getUserDisplayName } = useFirebaseUsersContext();
    const { forgotPassword, resetPassword, login } = useFirebaseAuth();

    const userData = {
        user: getAuth().currentUser,
        email: () => userData.user?.email? userData.user?.email: "",
        displayName: () => {
            const displayName = userData.user?.uid? getUserDisplayName(userData.user?.uid): '';
            return displayName? displayName: '';
        },
    };

    const handleForgotPassword = async () => {
        await forgotPassword(userData.email());
        alert(`Email sent to ${userData.email()}.\nProbably to spam folder ...`);
    };

    const SignupSchema = Yup.object().shape({
        email: Yup.string()
            .email(INVALID_EMAIL_MESSAGE)
            .required(REQUIRED_FIELD_MESSAGE)
            .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, INVALID_EMAIL_MESSAGE),
        password: Yup.string()
            .required(REQUIRED_FIELD_MESSAGE)
            .min(8, MIN_PASSWORD_LENGTH_MESSAGE),
        newPassword: Yup.string()
            .min(8, MIN_PASSWORD_LENGTH_MESSAGE)
            .notOneOf([Yup.ref('password')], REPEATED_PASSWORD_MESSAGE),
        repeatPassword: Yup.string()
            .test('test-newPassword-exists', UNMATCHING_PASSWORDS_MESSAGE, (value, ctx) => !ctx.parent.newPassword || value === ctx.parent.newPassword)
            .oneOf([Yup.ref('newPassword')], UNMATCHING_PASSWORDS_MESSAGE),
        displayName: Yup.string()
            .trim()
            .required(REQUIRED_FIELD_MESSAGE)
            .notOneOf(users.filter(user => user.id !== userData.user?.uid).map(user => user.data.displayName), REPEATED_DISPLAYNAME_MESSAGE),
    });

    const onSubmit = async (values: ISignupFormValues) => {
        setSaving(1);
        const correct = await login(values.email, values.password, true);
        if(correct && values.newPassword.length > 0) await resetPassword(values.newPassword);
        if(correct && userData.user && values.displayName !== getUserDisplayName(userData.user.uid)) await setUser(userData.user, values.displayName);

        setSaving(correct ? 2 : 3);
        setTimeout(() => setSaving(0), 2000);
    };

    if(userData.displayName() === '') return <SpinnerCustom />

    return (
        <Row>
            <Col xs={4}></Col>
            <Col xs={4}>
                <h1 className="textAlignCenter">My Account</h1>
                <Formik<ISignupFormValues>
                    initialValues={{
                        email: userData.email(),
                        password: "",
                        newPassword: "",
                        repeatPassword: "",
                        displayName: userData.displayName(),
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
                            
                            <p className="textAlignCenter">{`User ID: ${getAuth().currentUser?.uid}`}</p>

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
                                    plaintext
                                    readOnly
                                />
                                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                            </FloatingLabel>

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

                            <FloatingLabel label="Current Password">
                                <Form.Control
                                    id="password"
                                    type="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    //isValid={touched.password && !errors.password}
                                    isInvalid={touched.password && !!errors.password}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                            </FloatingLabel>

                            <p className="textAlignRight"><Button size="sm" variant="link" onClick={handleForgotPassword}>Forgot password?</Button></p>

                            <Form.Text>Password Reset:</Form.Text>

                            <FloatingLabel label="New Password">
                                <Form.Control
                                    id="newPassword"
                                    type="password"
                                    value={values.newPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isValid={values.newPassword.length > 0 && touched.newPassword && !errors.newPassword}
                                    isInvalid={touched.newPassword && !!errors.newPassword}
                                />
                                <Form.Control.Feedback type="invalid">{errors.newPassword}</Form.Control.Feedback>
                            </FloatingLabel>

                            <FloatingLabel label="Confirm New Password">
                                <Form.Control
                                    id="repeatPassword"
                                    type="password"
                                    value={values.repeatPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    isValid={values.repeatPassword.length > 0 && touched.repeatPassword && !errors.repeatPassword}
                                    isInvalid={touched.repeatPassword && !!errors.repeatPassword}
                                />
                                <Form.Control.Feedback type="invalid">{errors.repeatPassword}</Form.Control.Feedback>
                            </FloatingLabel>

                            <Button
                                style={{width: '100%'}}
                                type="submit"
                                size="lg"
                                disabled={!isValid || isValidating || saving !== 0}
                            >
                                {isSubmitting || isValidating || saving === 1?
                                    <SpinnerCustom as="span" variant="light"/>:
                                    (saving === 0 ? 'Save Changes' : (saving === 2 ? 'Changes saved successfully' : 'Wrong Current Password'))
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