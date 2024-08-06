import { Avatar, AvatarGroup, Box, Button, Flex, HStack, Icon, Image, Tag, Text } from '@chakra-ui/react';
import React from 'react'
import { FiMoreHorizontal, FiCalendar, FiMapPin } from "react-icons/fi";
import { formatEventTime } from '../../utils/formatEventDisplay';

const EventDetails = ({ event }) => {

    const { title, start, end, description, specificLocation, activityTags, membersGoing } = event;


    return (
        <Flex
            borderRadius='20px'
            bg={'gray.100'}
            direction='column'>
            <Box p='20px'>
                <Flex w='100%' mb='10px'>
                    <Text fontWeight='600'
                        color={'gray.800'}
                        w='100%' fontSize='2xl'>
                        {title}
                    </Text>
                    <Button
                        w='38px'
                        h='38px'
                        align='center'
                        justify='center'
                        borderRadius='12px'
                        me='12px'
                    >

                        <Icon
                            w='24px'
                            h='24px'
                            as={FiMoreHorizontal}
                            color={'gray.700'}
                        />
                    </Button>
                </Flex>
                <HStack wrap='wrap' spacing='3'>
                    {activityTags?.map((tag) => (
                        <Tag key={tag} variant='outline'>
                            {tag}
                        </Tag>
                    ))}

                </HStack>
            </Box >
            <Flex
                w='100%'
                p='20px'
                height='100%'
                direction='column'
                gap={8}
            >
                <Text
                    fontSize='sm'
                    color='gray.500'
                    lineHeight='24px'
                    pe='40px'
                    fontWeight='500'
                    mb='auto'>
                    {description}
                </Text>
                <Flex
                    flexDirection={{ base: 'column', md: 'row' }}
                    gap={{ base: '15px', md: '25px' }}
                    alignItems={{ base: 'flex-start', md: 'center' }}
                >
                    <Flex>
                        <Icon
                            as={FiCalendar}
                            w='20px' h='20px' me='6px' color='green.400' />
                        <Text
                            fontSize='sm' my='auto' fontWeight='500'>
                            {formatEventTime(start, end)}
                        </Text>
                    </Flex>
                    <Flex>
                        <Icon
                            as={FiMapPin}
                            w='20px'
                            h='20px'
                            me='6px'
                            color='red.500'
                        />
                        <Text
                            fontSize='sm' my='auto' fontWeight='500'>
                            {specificLocation.name}
                        </Text>
                    </Flex>
                    {/*  Присъстващи:  */}
                    <Box>
                        <AvatarGroup
                            size='sm'
                            max={4}
                            cursor='pointer'
                        >
                            {membersGoing.map((member) => (
                                <Avatar
                                    key={member._id}
                                    name={member.fullName}
                                    src={member.profilePic}
                                />
                            ))}
                        </AvatarGroup>
                    </Box>
                </Flex>
            </Flex>
        </Flex >
    );

}

export default EventDetails
