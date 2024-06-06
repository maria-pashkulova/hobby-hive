import { Skeleton, Stack } from "@chakra-ui/react"

const Loading = () => {
    return (
        <Stack my={5}>
            <Skeleton height='45px' />
            <Skeleton height='45px' />
            <Skeleton height='45px' />
        </Stack>
    )
}

export default Loading
