import { Card, CardBody, CardFooter, Divider, HStack, Heading, Stack, Tag, Text } from "@chakra-ui/react"

const EventCard = ({ name, description, specificLocation, time, activityTags }) => {
    return (
        <Card mt={5}>
            <CardBody>
                <Stack mt='6' spacing='3'>
                    <Heading as='h3' size='md'>{name}</Heading>
                    <HStack spacing='3'>
                        {activityTags.map((tag) => (
                            <Tag key={tag} variant='outline'>
                                {tag}
                            </Tag>
                        ))}
                    </HStack>
                    <Text mt='4'>
                        {description}
                    </Text>
                </Stack>
            </CardBody>
            <Divider />
            <CardFooter
                flexDir={{ base: 'column', lg: 'row' }}
                gap={{ base: 2, lg: 0 }}
                justifyContent='space-between'
            >
                <Text color='blue.600'>Място на провеждане: {specificLocation}</Text>
                <Text color='blue.600'>
                    Дата: {time}
                </Text>
            </CardFooter>
        </Card>
    )
}

export default EventCard
