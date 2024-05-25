import React from 'react'
import {
    Stack,
    Heading,
    Text,
    Box,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel
} from '@chakra-ui/react';

import Login from '../components/authentication/Login';
import Register from '../components/authentication/Register';


const StartPage = () => {
    return (
        <Stack direction='column' spacing='8' mx='auto' maxW='lg' py='12' px='6'>
            <Stack direction='column' alignItems='center'>
                <Heading fontSize={{ base: '2xl', md: '4xl' }}>Хоби Кошер</Heading>
                <Text fontSize={{ base: 'md', md: 'lg' }} color={'gray.600'}>
                    Намерете своето хоби сега!
                </Text>
            </Stack>
            <Box
                rounded={'lg'}
                bg='white'
                boxShadow={'lg'}
                p={8}>

                <Tabs variant='soft-rounded' colorScheme='yellow' isLazy={true}>
                    <TabList mb='1em'>
                        <Tab w='50%'>Вход</Tab>
                        <Tab w='50%'>Регистрация</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Login />
                        </TabPanel>
                        <TabPanel>
                            <Register />
                        </TabPanel>
                    </TabPanels>
                </Tabs>

            </Box>
        </Stack>

    )
}

export default StartPage;

