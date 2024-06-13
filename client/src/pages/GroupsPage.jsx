import { useContext, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

import AuthContext from '../contexts/authContext';
import Loading from '../components/Loading';

import * as groupService from '../services/groupService';
import CardsGrid from '../components/CardsGrid';
import { useToast } from '@chakra-ui/react';

const GroupsPage = () => {

    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {

        setLoading(true);

        groupService.getAll()
            .then((groups) => {
                setGroups(groups);
            })
            .catch(error => {
                //мисля че тук има нужда да проверявам статус кодовете
                //сървъра връща 401 - ако е изтекла бисквитката
                // ако го спра и не отговаря обаче не трябва да редиректва към login
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else {
                    //TODO: add some image or text so that the page wont be left empty (white screen)
                    toast({
                        title: "Възникна грешка!",
                        description: "Опитайте по-късно",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });
                }
            })
            .finally(() => {
                setLoading(false);
            });

    }, []);


    return loading ?
        (<Loading />) :
        (<CardsGrid groups={groups} partialLinkToGroup='groups' />);



}

export default GroupsPage
