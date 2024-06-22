import { Card, CardBody, CardFooter, Heading, SimpleGrid, Button, Text, Flex, Image, Spacer } from '@chakra-ui/react'
import { Link } from "react-router-dom";


const CardsGrid = ({ groups, partialLinkToGroup }) => {
    return (
        <SimpleGrid spacing={4} templateColumns={{ base: '1fr', xl: 'repeat(2,1fr)' }}>

            {groups.map((group) => (
                <Card
                    key={group._id}
                    direction={{ base: 'column', md: 'row' }}
                    overflow='hidden'
                    variant='outline'
                >
                    {group.imageUrl && <Image
                        objectFit='cover'
                        maxW={{ base: '100%', md: '200px' }}
                        src={group.imageUrl}
                        alt={group.name}
                    />}

                    <Flex direction='column' width='100%' >
                        <CardBody>
                            <Heading size='md'>{group.name}</Heading>

                            <Text py='2'>
                                {group.description}
                            </Text>
                        </CardBody>

                        <CardFooter alignItems='center' gap='4' >
                            <Button as={Link} to={`${partialLinkToGroup}/${group._id}`} variant='solid' colorScheme='blue'>
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

    )
}

export default CardsGrid;
