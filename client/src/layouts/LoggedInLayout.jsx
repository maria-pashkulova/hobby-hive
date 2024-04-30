import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import { Grid, GridItem } from '@chakra-ui/react';
import Sidebar from '../components/Sidebar';

const LoggedInLayout = () => {
    return (
        <Grid templateColumns='repeat(6, 1fr)' bg='gray.50'>
            <GridItem
                as='aside'
                colSpan={{ base: 6, lg: 1 }}
                bg='yellow.300'
                minHeight={{ lg: '100vh' }}
                p='5'
            >
                <Sidebar />
            </GridItem>
            <GridItem
                as='main'
                colSpan={{ base: 6, lg: 5 }}
                mx='3'
            >
                <Navbar />
                <Outlet />
            </GridItem>
        </Grid>


    )
}

export default LoggedInLayout
