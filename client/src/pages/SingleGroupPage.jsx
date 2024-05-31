import { Heading, Button, Container, Flex } from "@chakra-ui/react"
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
            .catch(error => {
                console.log(error.message);

                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else if (error.status === 404) {
                    navigate('/not-found');
                } else {
                    //handle other errors
                    console.log(error.message);
                }

            });

    }, []);


    return (
        <>

            <Flex justifyContent='space-between'>

                <Flex flexDirection='column' gap={2} mb={6}>
                    <Heading mb='6'>{group.name}</Heading>
                    <p>{group.description}</p>
                </Flex>
                <div>
                    <p>Hobby category: {group.category}</p>
                    <p>Location: {group.location}</p>
                    <p>members: {group.members}</p>

                </div>

            </Flex>
            <Flex gap={2}>
                <Button bgColor={"yellow.400"} as={Link} to={`/groups/${groupId}`}>Публикации</Button>
                <Button bgColor={"yellow.400"} as={Link} to={`/groups/${groupId}/events`}>Събития</Button>

            </Flex>

            <Container>
                <Outlet />
            </Container>



        </>

    )
}

export default SingleGroupPage
