import React from 'react'
import { Container, Box, Heading } from '@chakra-ui/react';

const StartPage = () => {
    return (
        // от туториъл за чат с MERN stack
        <Container maxWidth='5xl' centerContent>
            <Box
                p={3}
                bg='blue.300'
                borderRadius="lg"
                w="100%"
                margin={3}
                textAlign="center"
            >
                <Heading as='h1' size='lg'>
                    Хоби Кошер
                </Heading>
            </Box>
            <Box>

            </Box>
        </Container >
    )
}

export default StartPage;
