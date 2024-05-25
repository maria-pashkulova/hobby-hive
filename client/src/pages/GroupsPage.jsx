import { useEffect, useState } from 'react';
import { Card, CardBody, CardFooter, Heading, SimpleGrid, Button, Text, Flex, Image, Spacer } from '@chakra-ui/react'
import { Link, useNavigate } from "react-router-dom";


import * as groupService from '../services/groupService';

const GroupsPage = () => {

    const navigate = useNavigate();

    const [groups, setGroups] = useState([]);

    useEffect(() => {
        groupService.getAll()
            .then(setGroups)
            .catch(err => {
                console.log(err.message);
                navigate('/notLogged');
            })
    }, []);


    return (
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
                            <Button as={Link} to={`groups/${group._id}`} variant='solid' colorScheme='blue'>
                                Към групата
                            </Button>
                            <Spacer />
                            <Text as='span'>
                                {group.members} членове
                            </Text>
                        </CardFooter>
                    </Flex>
                </Card>

            ))}

        </SimpleGrid>

    )
}

export default GroupsPage
