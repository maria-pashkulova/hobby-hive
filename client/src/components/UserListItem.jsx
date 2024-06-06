import { Avatar, Box, Text } from "@chakra-ui/react"

const UserListItem = ({ fullName, profilePic, email }) => {
    return (
        <Box
            // onClick={handleFunction}
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
                name={fullName}
                src={profilePic}
            />
            <Box>
                <Text>{fullName}</Text>
                <Text fontSize="xs">
                    <b>Email : </b>
                    {email}
                </Text>
            </Box>
        </Box>
    )
}

export default UserListItem
