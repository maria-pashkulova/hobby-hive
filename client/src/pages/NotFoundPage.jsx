import { Box, Button, Heading, Text } from "@chakra-ui/react"
import { Link } from "react-router-dom"

const NotFoundPage = () => {
    return (
        <Box textAlign="center" py={10} px={6}>
            <Heading
                display="inline-block"
                as="h2"
                size="2xl"
                bgGradient="linear(to-r, blue.400, blue.600)"
                backgroundClip="text" //The background is painted within (clipped to) the foreground text.
            >
                404
            </Heading>
            <Text fontSize="18px" mt={3} mb={2}>
                Несъществуваща страница!
            </Text>
            <Text color={'gray.500'} mb={6}>
                Страницата, която търсите не беше намерена!
            </Text>

            <Button
                colorScheme="blue"
                bgGradient="linear(to-r, blue.400, blue.500, blue.600)"
                color="white"
                variant="solid"
                as={Link}
                to='/'
            >
                Към началната страница
            </Button>
        </Box>
    )
}

export default NotFoundPage
