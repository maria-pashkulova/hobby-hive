import { Flex } from "@chakra-ui/react";
import { FiX } from "react-icons/fi";

const UserBadgeItem = () => {
    return (
        <Flex
            alignItems='center'
            gap={2}
            my={2}
            p={3}
            borderRadius="lg"
            bg='yellow.400'
            fontSize={12}
        // onClick={handleFunction}
        >
            Име Фамилия
            {/* {admin === user._id && <span> (Admin)</span>} */}
            <FiX pl={1} />


        </Flex>
    )
}

export default UserBadgeItem;
