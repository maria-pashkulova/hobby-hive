import React from 'react'
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import { Grid, GridItem } from '@chakra-ui/react';

const LoggedInLayout = () => {
    return (
        <Grid templateColumns='repeat(6, 1fr)' bg='gray.50'>
            <GridItem
                as='aside'
                colSpan='1'
                bg='yellow.300'
                minHeight='100vh'
                p='30px'
            >
                <span>sideBar</span>
            </GridItem>
            <GridItem
                as='main'
                colSpan='5'
            >
                <Navbar />
                <Outlet />
            </GridItem>
        </Grid>


    )
}

export default LoggedInLayout
