import React from 'react'
import { Flex, Box, Heading, Text, Button, Spacer } from "@chakra-ui/react";

export default function Navbar() {
    return (
        <Flex as='nav' py='15px' px='30px' alignItems="center" gap='20px'>
            <Heading>Хоби Кошер</Heading>
            <Spacer />

            <Box bg='gray.200' p='10px' >MП</Box>
            <Text>mpashkulova@gmail.com</Text>
            <Button colorScheme='yellow'>Logout</Button>
        </Flex>
    )
}
