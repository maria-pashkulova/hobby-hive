import { useEffect, useContext } from 'react';
import * as userService from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import AuthContext from "../../contexts/authContext";

const Logout = () => {

    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);
    useEffect(() => {

        //logout от сървъра - оторизирана заявка (изисква бисквитка с валиден токен)
        //logout от клиента 

        userService.logout()
            .then(() => {
                logoutHandler();
                navigate('/login')
            })
            .catch(() => {
                //за момента на сървъра logout e protected и хвърля грешка
                //401 и мисля че няма друг случай
                logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                navigate('/login')
            });

    }, []);

    return null;
}

export default Logout;
