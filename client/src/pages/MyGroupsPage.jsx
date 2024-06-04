import { Button, Card, CardBody, CardFooter, Flex, Heading, Image, SimpleGrid, Spacer, Text, useDisclosure } from "@chakra-ui/react"
import CreateGroupModal from "../components/CreateGroupModal"
import { FiPlus } from "react-icons/fi";

import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

import * as authService from '../services/authService';
import AuthContext from "../contexts/authContext";

const MyGroupsPage = () => {

    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    const [groups, setGroups] = useState([]);

    useEffect(() => {
        authService.getMyGroups()
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
        setGroups((groups) => ([...groups, newGroup]));
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


            {/* My Groups + Create Group Button */}
            <SimpleGrid spacing={4} templateColumns={{ base: '1fr', xl: 'repeat(2,1fr)' }}>

                {groups.map((group, i) => (
                    <Card
                        key={i}
                        direction={{ base: 'column', md: 'row' }}
                        overflow='hidden'
                        variant='outline'
                    >
                        <Image
                            objectFit='cover'
                            maxW={{ base: '100%', md: '200px' }}
                            src={group.imageUrl}
                            alt={group.name}
                        />

                        <Flex direction='column' width='100%' >
                            <CardBody>
                                <Heading size='md'>{group.name}</Heading>

                                <Text py='2'>
                                    {group.description}
                                </Text>
                            </CardBody>

                            <CardFooter alignItems='center' gap='4' >
                                {/* use absolute path instead of relative one here */}
                                <Button as={Link} to={`/groups/${group._id}`} variant='solid' colorScheme='blue'>
                                    Към групата
                                </Button>
                                <Spacer />
                                <Text as='span'>
                                    Членове: {group.membersCount}
                                </Text>
                            </CardFooter>
                        </Flex>
                    </Card>

                ))}

            </SimpleGrid>


        </>
    )
}

export default MyGroupsPage
