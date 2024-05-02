import { Flex, Heading, IconButton, Box, Text, HStack, Avatar, Menu, MenuButton, MenuList, MenuItem, MenuDivider } from '@chakra-ui/react';

import { FiMenu, FiChevronDown, FiBell } from "react-icons/fi";

const Header = ({ onOpen }) => {
    return (
        <Flex
            as='header'
            px='4'
            mb='4'
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
                                src={
                                    'https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
                                }
                            />
                            <Text display={{ base: 'none', md: 'flex' }} fontSize="sm">Мария Пашкулова</Text>
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
                        <MenuItem>Изход</MenuItem>
                    </MenuList>
                </Menu>
            </HStack>
        </Flex>
    )
}

export default Header;
