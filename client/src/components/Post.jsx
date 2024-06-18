import { Avatar, Box, Flex, Text, Image } from '@chakra-ui/react'
import { BsThreeDots } from "react-icons/bs";
import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { bg } from 'date-fns/locale'

const Post = ({ text, img, postedBy, postedByProfilePic, createdAt }) => {
    return (
        <Flex gap={3} mb={4} py={5}>
            <Flex flexDirection='column' alignItems='center'>
                <Avatar
                    size='md'
                    name={postedBy}
                    src={postedByProfilePic}
                />
                <Box w='1px' h='full' bg='gray.300' my={2}></Box>

            </Flex>

            <Flex flex={1} flexDirection='column' gap={2}>
                <Flex justifyContent='space-between' w='full'>

                    <Text fontSize='sm' fontWeight='bold'>{postedBy}</Text>


                    <Text fontSize='sm' color={"gray.light"}>
                        преди {formatDistanceToNow(new Date(createdAt), { locale: bg })}
                    </Text>


                </Flex>

                <Text maxWidth={'lg'} fontSize='sm'>{text}</Text>

                {img && (
                    <Box
                        borderRadius={6}
                        overflow='hidden'
                    >
                        <Image w='full' src={img}></Image>

                    </Box>)}

            </Flex>


        </Flex >
    )
}

export default Post
