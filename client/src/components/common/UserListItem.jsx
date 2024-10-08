import { Avatar, Box, Text } from "@chakra-ui/react"
import { FiX } from "react-icons/fi";

const UserListItem = ({ user, handleFunction, isRemovable, handleRemove, isAdmin }) => {
    return (
        <Box
            onClick={handleFunction}
            cursor="pointer"
            bg="#E8E8E8"
            _hover={{
                background: "yellow.400",
            }}
            w="100%"
            display='flex'
            flexDir={{ base: 'column', sm: 'row' }}
            gap={{ base: '4', sm: '0' }}
            justifyContent="space-between"
            color="black"
            px={3}
            py={2}
            my={2}
            borderRadius="lg"
        >
            <Box display='flex'
                alignItems="center">
                <Avatar
                    mr={2}
                    size={{ base: 'sm', sm: 'md' }}
                    name={user.fullName}
                    src={user.profilePic}
                />
                <Box>
                    <Text>{user.fullName}</Text>
                    <Text fontSize="xs">
                        <b>Имейл: </b>
                        {user.email}
                    </Text>
                </Box>
            </Box>

            <Box display='flex' justifyContent={{ base: 'center', sm: 'space-betweeen' }}>
                {isRemovable && (
                    <FiX pl={1}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemove()
                        }}
                        cursor='pointer'
                    />)}
                {isAdmin && <Text>(Администратор)</Text>}
            </Box>

        </Box>
    )
}

export default UserListItem
