import { useEffect, useState } from 'react';
import { Card, CardBody, CardFooter, Heading, SimpleGrid, Button, Text, Flex, Image, Spacer } from '@chakra-ui/react'

const GroupsPage = () => {

    const [groups, setGroups] = useState([]);

    const fetchGroups = () => {
        fetch('http://localhost:5000')
            .then(res => res.json())
            .then(data => setGroups(data));
    }

    useEffect(() => {
        fetchGroups();
    }, []);


    return (
        <SimpleGrid spacing={4} templateColumns={{ base: 'repeat(1,1fr)', lg: 'repeat(2,1fr)' }}>

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
                            <Button variant='solid' colorScheme='blue'>
                                Към групата
                            </Button>
                            <Spacer />
                            <Text as='span'>
                                20 членове
                            </Text>
                        </CardFooter>
                    </Flex>
                </Card>

            ))}

        </SimpleGrid>

    )
}

export default GroupsPage
