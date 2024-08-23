import { Flex, Heading, IconButton, Box, Text, HStack, Avatar, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Badge, Tag } from '@chakra-ui/react';

import { FiMenu, FiChevronDown, FiBell, FiX } from "react-icons/fi";
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../../contexts/authContext';

import useNotifications from '../../hooks/useNotifications';


const Header = ({ onOpen }) => {

    const { fullName, profilePic, userId } = useContext(AuthContext);
    const { notifications, notificationsCount, handleHideNotificationIndicator, handleMarkNotificationAsRead } = useNotifications();
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
                display={{ base: 'flex', md: 'none' }}
                fontSize="2xl">
                ХК
            </Heading>

            {/* notifications bell and avatar*/}

            <HStack spacing={{ base: '1', lg: '3' }}>
                <Menu>
                    <MenuButton
                        p={2}
                        borderRadius={4}
                        m={2}
                        _hover={{
                            background: 'gray.100',
                        }}
                        position='relative'
                        onClick={handleHideNotificationIndicator}
                    >
                        {notificationsCount !== 0 &&
                            <Badge
                                position='absolute'
                                top="-10px"
                                colorScheme="red"
                                icon={<FiX />}
                            >
                                {notificationsCount}
                            </Badge>

                        }
                        <FiBell />

                    </MenuButton>
                    <MenuList
                        minW={'40vw'}
                        maxW={'70vw'}
                    >
                        {!notifications.length ?
                            (<MenuItem>Нямате нови известия</MenuItem>)
                            :
                            notifications.map((notification) =>
                            (<MenuItem
                                w={'100%'}
                                as={Link}
                                to={`/groups/${notification.fromGroup}/${notification.type === 'event'
                                    ? 'events'
                                    : notification.type === 'request'
                                        ? 'event-change-requests'
                                        : 'chat'
                                    }`}
                                state={
                                    {
                                        isMemberFromNotification: notification.isMemberFromNotification,
                                        isGroupAdminFromNotifications: notification.isGroupAdminFromNotifications,
                                        eventStart: notification.eventStart
                                    }
                                }
                                key={notification.uniqueIdentifier}
                                onClick={() => {
                                    handleMarkNotificationAsRead(notification.uniqueIdentifier);
                                }}
                            >

                                <Flex
                                    p={3}
                                    w={'100%'}
                                    flexDir="column"
                                    flexWrap={'wrap'}
                                    borderLeftWidth={10}
                                    borderLeftRadius={3}
                                    borderColor={notification.notificationColor || 'yellow.300'}
                                    gap={2}
                                >
                                    <Heading as='h3' size='sm'>{notification.notificationAbout}</Heading>
                                    {notification.eventName && <Text fontStyle={'italic'}>{notification.eventName}</Text>}
                                    <Tag p={2} variant='outline'>
                                        {notification.groupName}
                                    </Tag>
                                </Flex>

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
