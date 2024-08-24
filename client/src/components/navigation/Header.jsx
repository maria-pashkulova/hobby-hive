import { Flex, Heading, IconButton, HStack } from '@chakra-ui/react';

import { FiMenu } from "react-icons/fi";

import NotificationsMenuList from '../NotificationsMenuList';
import CurrentUserMenuList from '../CurrentUserMenuList';


const Header = ({ onOpen }) => {

    return (
        <Flex
            as='header'
            px='4'
            height="20"
            alignItems="center"
            borderBottomWidth="1px"
            borderBottomColor='gray.200'
            justifyContent={{ base: 'space-between', lg: 'flex-end' }}>

            {/* mobile */}
            <IconButton
                display={{ base: 'flex', lg: 'none' }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<FiMenu />}
            />
            <Heading
                display={{ base: 'flex', lg: 'none' }}
                fontSize="2xl">
                ХК
            </Heading>

            {/* notifications and current logged in user menus*/}

            <HStack spacing={{ base: '1', lg: '3' }}>

                <NotificationsMenuList />

                <CurrentUserMenuList />
            </HStack>
        </Flex>
    )
}

export default Header;
