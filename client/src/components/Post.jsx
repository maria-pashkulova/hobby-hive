import { Avatar, Box, Flex, Text, Image } from '@chakra-ui/react'
import { BsThreeDots } from "react-icons/bs";
import React from 'react'

const Post = ({ text }) => {
    return (
        <Flex gap={3} mb={4} py={5}>
            <Flex flexDirection='column' alignItems='center'>
                <Avatar
                    size='md'
                    src='https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
                />
                <Box w='1px' h='full' bg='gray.300' my={2}></Box>

            </Flex>

            <Flex flex={1} flexDirection='column' gap={2}>
                <Flex justifyContent='space-between' w='full'>

                    <Text fontSize='sm' fontWeight='bold'>Име и фамилия</Text>

                    <Flex gap={4} alignItems='center'>
                        <Text fontSize='sm' color={"gray.light"}>1d</Text>
                        <BsThreeDots />
                    </Flex>

                </Flex>

                <Text fontSize='sm'>{text}</Text>
                <Box
                    borderRadius={6}
                    overflow='hidden'
                >
                    <Image w='full' src='https://static01.nyt.com/images/2020/03/31/sports/31virus-tennis02/31virus-tennis02-articleLarge-v2.jpg?quality=75&auto=webp&disable=upscale'></Image>

                </Box>
            </Flex>


        </Flex >
    )
}

export default Post
