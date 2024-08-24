import { Avatar, Box, HStack, Menu, MenuButton, MenuDivider, MenuItem, MenuList, Text } from "@chakra-ui/react"
import { useContext } from "react";
import { FiChevronDown } from "react-icons/fi"
import AuthContext from "../contexts/authContext";
import { Link } from "react-router-dom";

const CurrentUserMenuList = () => {
    const { fullName, profilePic } = useContext(AuthContext);
    const avatarKey = profilePic ? 'withImage' : 'withoutImage';
    return (
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
    )
}

export default CurrentUserMenuList
