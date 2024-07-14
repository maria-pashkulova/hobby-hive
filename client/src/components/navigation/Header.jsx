import { Flex, Heading, IconButton, Box, Text, HStack, Avatar, Menu, MenuButton, MenuList, MenuItem, MenuDivider } from '@chakra-ui/react';

import { FiMenu, FiChevronDown, FiBell } from "react-icons/fi";
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../../contexts/authContext';

import useNotifications from '../../hooks/useNotifications';


const Header = ({ onOpen }) => {

    const { fullName, profilePic, userId } = useContext(AuthContext);
    const { notifications, handleMarkNotificationAsRead } = useNotifications();
    const avatarKey = profilePic ? 'withImage' : 'withoutImage';

    return (
        <Flex
            as='header'
            px='4'
            // mb='4'
            height="20"
            alignItems="center"
            borderBottomWidth="1px"
            borderBottomColor='gray.200'
            justifyContent={{ base: 'space-between', md: 'flex-end' }}>

            {/* mobile */}
            <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<FiMenu />}
            />
            <Heading
                display={{ base: 'flex', md: 'none' }}
                fontSize="2xl">
                ХК
            </Heading>

            {/* notifications bell and avatar*/}

            <HStack spacing={{ base: '1', md: '3' }}>
                {/* TODO - put Menu dropdown for notifications */}

                <Menu>
                    <MenuButton
                        p={2}
                        borderRadius={4}
                        m={2}
                        _hover={{
                            background: 'gray.100',
                        }}>
                        <FiBell />
                    </MenuButton>
                    <MenuList>
                        {!notifications.length ?
                            (<MenuItem>Нямате нови известия</MenuItem>)
                            :
                            notifications.map((notification) =>
                            (<MenuItem
                                as={Link}
                                to={`/groups/${notification.fromGroup}/chat`}
                                key={notification.uniqueIdentifier}
                                onClick={() => {
                                    handleMarkNotificationAsRead(notification.uniqueIdentifier);
                                }}
                            >

                                {notification.notificationTitle}
                            </MenuItem>)

                            )
                        }

                    </MenuList>

                </Menu>
                <Menu>
                    <MenuButton py={2}>
                        <HStack >
                            <Avatar
                                key={avatarKey}
                                size={'sm'}
                                name={fullName}
                                src={profilePic}
                            />
                            <Text display={{ base: 'none', md: 'flex' }} fontSize="sm">{fullName}</Text>
                            <Box display={{ base: 'none', md: 'flex' }}>
                                <FiChevronDown />
                            </Box>
                        </HStack>
                    </MenuButton>
                    <MenuList
                        bg='white'
                        borderColor='gray.200'>
                        <MenuItem as={Link} to={'/update-profile'}>Редактиране на профила</MenuItem>
                        <MenuDivider />
                        <MenuItem as={Link} to={'/logout'}>Изход</MenuItem>
                    </MenuList>
                </Menu>
            </HStack>
        </Flex>
    )
}

export default Header;
