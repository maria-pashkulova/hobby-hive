import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import { Box, useDisclosure } from '@chakra-ui/react';
import Sidebar from '../components/navigation/Sidebar';

const LoggedInLayout = () => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <Box minH="100vh" >
            <Sidebar
                onClose={onClose}
                display={{ base: 'none', md: 'block' }}
            />
            <Box ml={{ base: 0, md: 60 }} p="4">
                <Outlet />
            </Box>

        </Box>
    )
}

export default LoggedInLayout
