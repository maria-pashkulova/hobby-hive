import { useEffect, useContext } from 'react';
import * as authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import AuthContext from "../contexts/authContext";

const Logout = () => {

    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);
    useEffect(() => {

        //logout от сървъра
        //logout от клиента ? - зависи дали ще работя с бисквитки или хедърс

        authService.logout()
            .then(() => {
                logoutHandler();
                navigate('/login')
            })
            .catch(() => navigate('/'))

    }, []);

    return null;
}

export default Logout;
