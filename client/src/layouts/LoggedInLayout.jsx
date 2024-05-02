import { Outlet } from 'react-router-dom';
import { Box, Drawer, DrawerContent, useDisclosure } from '@chakra-ui/react';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';

const LoggedInLayout = () => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <>
            <Sidebar
                display={{ base: 'none', md: 'block' }}
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
            <Box as='main' ml={{ base: 0, md: 60 }} p="4">
                <Outlet />
            </Box>
        </>


    )
}

export default LoggedInLayout
