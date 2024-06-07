import { Button, Flex, Heading, useDisclosure } from "@chakra-ui/react"
import CreateGroupModal from "../components/create-group/CreateGroupModal"
import { FiPlus } from "react-icons/fi";

import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

import * as userService from '../services/userService';
import AuthContext from "../contexts/authContext";
import CardsGrid from "../components/CardsGrid";

const MyGroupsPage = () => {

    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    const [groups, setGroups] = useState([]);

    useEffect(() => {
        userService.getMyGroups()
            .then(setGroups)
            .catch(error => {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else {
                    console.log(error);
                }
            })
    }, []);

    const addNewCreatedGroup = (newGroup) => {
        setGroups((groups) => ([newGroup, ...groups]));
    }

    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <>
            <Flex justifyContent='space-between' py={8} flexDirection={{ base: 'column', lg: 'row' }}>

                <Heading mb='6' size='lg'>Групите, в които членувате</Heading>

                <Button
                    d='flex'
                    leftIcon={<FiPlus />}
                    onClick={onOpen}
                >
                    Създай група
                </Button>

                {isOpen && <CreateGroupModal
                    isOpen={isOpen}
                    onClose={onClose}
                    addNewCreatedGroup={addNewCreatedGroup}
                />}

            </Flex>

            <CardsGrid groups={groups} partialLinkToGroup='/groups' />

        </>
    )
}

export default MyGroupsPage
