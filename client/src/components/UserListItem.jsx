import { Avatar, Box, Text } from "@chakra-ui/react"

const UserListItem = ({ user, handleSelectUser }) => {
    return (
        <Box
            onClick={handleSelectUser}
            cursor="pointer"
            bg="#E8E8E8"
            _hover={{
                background: "yellow.400",
            }}
            w="100%"
            display='flex'
            alignItems="center"
            color="black"
            px={3}
            py={2}
            my={2}
            borderRadius="lg"
        >
            <Avatar
                mr={2}
                size="sm"
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
    )
}

export default UserListItem
