import { Box, Circle, Divider, Text } from "@chakra-ui/react";
import { FiMapPin } from "react-icons/fi";
import { getLocationData } from '../../utils/getLocationData';

const LocationItem = ({ location, selectLocation }) => {
    return (
        <>
            <Box
                display='flex'
                alignItems="center"
                cursor="pointer"
                gap={4}
                py={2}
                my={2}
                onClick={selectLocation}

            >
                <Circle size='40px' bg='tomato' color='white'>
                    <FiMapPin />
                </Circle>
                <Text>{getLocationData(location)}</Text>

            </Box>
            <Divider />

        </>

    )
}

export default LocationItem
