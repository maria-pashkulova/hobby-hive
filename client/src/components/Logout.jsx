import { useEffect } from 'react';
import * as authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Logout = () => {

    const navigate = useNavigate();
    useEffect(() => {

        //logout от сървъра
        //logout от клиента ? - зависи дали ще работя с бисквитки или хедърс

        authService.logout()
            .then(() => {
                navigate('/notLogged')
            })
            .catch(() => navigate('/notLogged'))

    }, []);

    return null;
}

export default Logout
