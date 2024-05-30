import { Heading, Button } from "@chakra-ui/react"
import { useContext, useEffect, useState } from "react"
import { Link, Outlet, useNavigate, useParams } from "react-router-dom"

import * as groupService from '../services/groupService';

import AuthContext from '../contexts/authContext';


const SingleGroupPage = () => {


    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    const { groupId } = useParams();
    const [group, setGroup] = useState({});


    useEffect(() => {
        groupService.getById(groupId)
            .then(setGroup)
            .catch(err => {
                console.log(err.message);
                logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                navigate('/login');
            });

    }, []);


    return (
        <>
            <Heading mb='6'>{group.name}</Heading>

            <p>Hobby category: {group.category}</p>
            <p>Description: {group.description}</p>
            <p>Location: {group.location}</p>
            <p>members: {group.members}</p>

            <nav>
                <Button bgColor={"greenyellow"} as={Link} to={`/groups/${groupId}`}>Публикации</Button>
                <Button bgColor={"greenyellow"} as={Link} to={`/groups/${groupId}/events`}>Събития</Button>
            </nav>

            <Outlet />


        </>

    )
}

export default SingleGroupPage
