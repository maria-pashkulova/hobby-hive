import { useContext } from 'react'
import {
    Stack,
    Heading,
    Text,
    Box
} from '@chakra-ui/react';


import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from "../contexts/authContext";

const GuestLayout = () => {
    console.log('guest layout')
    const { isAuthenticated } = useContext(AuthContext);

    console.log(isAuthenticated);
    return !isAuthenticated ? (
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

                <Outlet />

            </Box>
        </Stack>

    ) : <Navigate to='/' />
}

export default GuestLayout;

