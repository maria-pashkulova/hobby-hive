import { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

import AuthContext from '../contexts/authContext';

import * as groupService from '../services/groupService';
import CardsGrid from '../components/CardsGrid';

const GroupsPage = () => {

    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    const [groups, setGroups] = useState([]);

    useEffect(() => {
        groupService.getAll()
            .then(setGroups)
            .catch(error => {
                //мисля че тук няма нужда да проверявам статус кодовете
                //защото сървъра връща единствено 401 - ако е изтекла бисквитката
                console.log(error.message);
                logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                navigate('/login');
            })
    }, []);


    return (
        <CardsGrid groups={groups} partialLinkToGroup='groups' />
    )
}

export default GroupsPage
