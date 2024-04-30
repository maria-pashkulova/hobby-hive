import { Flex, Box, Heading, Text, Button, Spacer } from "@chakra-ui/react";

export default function Navbar() {
    return (

        <Flex justifyContent='flex-end' as='nav' mb='4' py='4' px='8' alignItems="center" gap='5'>
            {/* <Heading>Хоби Кошер</Heading> */}
            {/* <Spacer /> */}

            <Box bg='gray.200' p='10px' >MП</Box>
            <Text>mpashkulova@gmail.com</Text>
            <Button colorScheme='yellow'>Изход</Button>
        </Flex>
    )
}
//TODO