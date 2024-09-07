import { Flex } from "@chakra-ui/react";
import { FiX } from "react-icons/fi";

const UserBadgeItem = ({ user, handleRemoveUser }) => {
    return (
        <Flex
            alignItems='center'
            gap={2}
            p={3}
            borderRadius="lg"
            bg='yellow.400'
            fontSize={12}
        >
            {user.fullName}
            <FiX pl={1}
                onClick={handleRemoveUser}
                cursor='pointer'
            />


        </Flex>
    )
}

export default UserBadgeItem;
