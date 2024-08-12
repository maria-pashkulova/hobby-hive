import { Button, Card, CardBody, CardFooter, Divider, Flex, Heading, IconButton, Stack, Text, Tooltip } from "@chakra-ui/react"
import { FiCheck, FiEye } from "react-icons/fi";

import formatDate from '../utils/formatDate';

const GroupEventChangeRequests = ({ eventTitle, requestDescription, requestedFrom, requestDate }) => {

    return (
        <Card mt={5}>
            <CardBody>
                <Stack mt='6' spacing='3'>
                    <Flex
                        flexDirection={{ base: 'column', md: 'row' }}
                        gap={5}
                        justifyContent={'space-between'}
                    >
                        <Heading as='h3' size='md'>Заявка за събитие: {eventTitle}</Heading>
                        <Flex
                            gap={2}
                        >
                            <Tooltip label='Към събитието в календара' placement="bottom-end">
                                <IconButton
                                    isRound={true}
                                    variant='solid'
                                    colorScheme='blue'
                                    aria-label='Done'
                                    fontSize='20px'
                                    icon={<FiEye />}
                                />
                            </Tooltip >
                            <Tooltip label='Отбележи като прегледано' placement="bottom-end">
                                <IconButton
                                    isRound={true}
                                    variant='solid'
                                    colorScheme='green'
                                    aria-label='Done'
                                    fontSize='20px'
                                    icon={<FiCheck />}
                                />
                            </Tooltip >
                        </Flex>

                    </Flex>
                    <Text mt='4'>
                        <Text as="span" fontWeight="bold">Описание:</Text> {requestDescription}
                    </Text>
                </Stack>
            </CardBody>
            <Divider />
            <CardFooter
                flexDir={{ base: 'column', lg: 'row' }}
                gap={{ base: 2, lg: 0 }}
                justifyContent='space-between'
            >
                <Text color='blue.600'>
                    <Text as="span" fontWeight="bold">Заявено от:</Text> {requestedFrom}
                </Text>
                <Text color='blue.600'>
                    <Text as="span" fontWeight="bold">Заявено на:</Text> {formatDate(requestDate)}
                </Text>
            </CardFooter>
        </Card >
    )
}

export default GroupEventChangeRequests;
