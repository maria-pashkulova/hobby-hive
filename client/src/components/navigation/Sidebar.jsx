import { Box, Flex, Heading, CloseButton, List, ListItem } from '@chakra-ui/react'
import { FiHome, FiCompass, FiStar } from "react-icons/fi";
import NavItem from './NavItem';

const listItems = [
    { title: 'Начало', icon: FiHome, to: '/' },
    { title: 'Моите групи', icon: FiStar, to: '/my-groups' }
];


const Sidebar = ({ onClose, display }) => {

    return (
        <Box
            as='nav'
            bg='gray.100'
            w={{ base: 'full', md: 60 }}
            position="fixed"
            h="full"
            display={display}
        >
            <Flex h="20" alignItems="center" mx='8' justifyContent="space-between">
                <Heading fontSize="2xl" >
                    Хоби Кошер
                </Heading>
                <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
            </Flex>
            <List>
                {listItems.map((link, index) => (
                    <NavItem
                        key={index}
                        title={link.title}
                        icon={link.icon}
                        to={link.to}
                        onClose={onClose}
                    />
                ))
                }
            </List>

        </Box >)
}

export default Sidebar
