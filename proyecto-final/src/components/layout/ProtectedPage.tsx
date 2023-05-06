import React from "react";
import { useFirebaseAuth } from "../../contexts/FirebaseAuthContext";
import { useNavigate } from "react-router-dom";

export const ProtectedPage: React.FC<React.PropsWithChildren> = ({children}) => {
    const { authUser, loadingAuthUser } = useFirebaseAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!loadingAuthUser && !authUser) navigate("/login");
    }, [loadingAuthUser, authUser, navigate]);

    return <>{children}</>;
};