import { Flex, Heading, IconButton, Box, Text, HStack, Avatar, Menu, MenuButton, MenuList, MenuItem, MenuDivider } from '@chakra-ui/react';

import { FiMenu, FiChevronDown, FiBell } from "react-icons/fi";
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../../contexts/authContext';


const Header = ({ onOpen }) => {

    const { fullName, profilePic, userId } = useContext(AuthContext);
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
                <IconButton
                    size="lg"
                    variant="ghost"
                    aria-label="open menu"
                    icon={<FiBell />}
                />
                <Menu>
                    <MenuButton py={2}>
                        <HStack >
                            <Avatar
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
                        <MenuItem>Моят профил</MenuItem>
                        <MenuDivider />
                        <MenuItem as={Link} to={'/logout'}>Изход</MenuItem>
                    </MenuList>
                </Menu>
            </HStack>
        </Flex>
    )
}

export default Header;
