import { Link } from "react-router-dom";
import { Flex, Icon, ListItem } from '@chakra-ui/react';

const NavItem = ({ title, icon, to }) => {
    return (
        <ListItem>
            <Link to={to}>
                <Flex
                    alignItems="center"
                    p="4"
                    mx="4"
                    borderRadius="lg"
                    role="group"
                    cursor="pointer"
                    _hover={{
                        bg: 'yellow.400'
                    }}
                >
                    <Icon
                        mr="4"
                        fontSize="18"
                        as={icon}
                    />
                    {title}
                </Flex>
            </Link>
        </ListItem >

    )
}

export default NavItem
