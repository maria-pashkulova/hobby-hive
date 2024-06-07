import { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

import AuthContext from '../contexts/authContext';
import Loading from '../components/Loading';

import * as groupService from '../services/groupService';
import CardsGrid from '../components/CardsGrid';

const GroupsPage = () => {

    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        setLoading(true);

        groupService.getAll()
            .then((groups) => {
                setLoading(false);

                setGroups(groups);
            })
            .catch(error => {
                //мисля че тук няма нужда да проверявам статус кодовете
                //защото сървъра връща единствено 401 - ако е изтекла бисквитката
                console.log(error.message);
                logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                navigate('/login');
            })
    }, []);


    return loading ?
        (<Loading />) :
        (<CardsGrid groups={groups} partialLinkToGroup='groups' />);



}

export default GroupsPage
