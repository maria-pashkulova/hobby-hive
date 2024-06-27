import { Box, Button, Flex, Heading, Text, useDisclosure, useToast } from "@chakra-ui/react"
import CreateGroupModal from "../components/create-group/CreateGroupModal"
import { FiPlus } from "react-icons/fi";

import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

import * as userService from '../services/userService';
import AuthContext from "../contexts/authContext";
import CardsGrid from "../components/CardsGrid";
import Pagination from "../components/Pagination";

const GROUPS_PER_PAGE = 3;


const MyGroupsPage = () => {

    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    const [groups, setGroups] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pagesCount, setPagesCount] = useState(0);

    const [fetchMyGroupsAgain, setFetchMyGroupsAgain] = useState(false);

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    useEffect(() => {
        userService.getMyGroups({
            page: currentPage,
            limit: GROUPS_PER_PAGE
        })
            .then(({ groups, totalPages }) => {
                setGroups(groups);
                setPagesCount(totalPages);
            })
            .catch(error => {
                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else {
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
    }, [currentPage, fetchMyGroupsAgain]);


    //When new group is created, groups are re-fetched
    //Handler needed in Create group modal
    const setRefetch = (status) => {
        setFetchMyGroupsAgain(status);
    }

    //PAGINATION RELATED
    //Handler needed in Create group modal and Pagination components
    const handleCurrentPageChange = (currPage) => {
        setCurrentPage(currPage);
    }

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
                    setRefetch={setRefetch}
                    handleCurrentPageChange={handleCurrentPageChange}
                />}

            </Flex>

            {groups.length === 0
                ? (<Text>Не членувате в нито една група. Създайте своята сега!</Text>)
                : (<CardsGrid groups={groups} partialLinkToGroup='/groups' />)
            }

            {pagesCount > 1 && (
                <Box
                    position='sticky'
                    top='100%'
                >
                    <Pagination
                        pagesCount={pagesCount}
                        currentPage={currentPage}
                        handleCurrentPageChange={handleCurrentPageChange}
                    />
                </Box>)
            }



        </>
    )
}

export default MyGroupsPage
