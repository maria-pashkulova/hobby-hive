import { Outlet, Navigate } from 'react-router-dom';
import { Box, Drawer, DrawerContent, useDisclosure } from '@chakra-ui/react';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';
import { useContext } from 'react';
import AuthContext from "../contexts/authContext";

const AuthLayout = () => {

    console.log('Auth layout');
    const { isAuthenticated } = useContext(AuthContext);
    const { isOpen, onOpen, onClose } = useDisclosure();

    return isAuthenticated ? (
        <>
            <Sidebar
                display={{ base: 'none', lg: 'block' }}
            />
            <Drawer
                isOpen={isOpen}
                placement="left"
                size="full"
                onClose={onClose}
                onOverlayClick={onClose}
            >
                <DrawerContent>
                    <Sidebar onClose={onClose} />
                </DrawerContent>
            </Drawer>
            <Header onOpen={onOpen} />
            <Box
                as='main'
                ml={{ base: 0, lg: 60 }}
                p="4"
                minH={'full'}
            >
                <Outlet />
            </Box>
        </>
    ) : <Navigate to='/login' />
}

export default AuthLayout;
