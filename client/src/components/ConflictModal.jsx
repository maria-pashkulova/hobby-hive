import { Box, Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react"
import { Link } from "react-router-dom"

const ConflictModal = ({ isOpen, onClose, conflictHeading, conflictDescription, conflictEvents }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent
                maxWidth={{ base: '90vw', md: '80vw', lg: '50vw', xl: '35vw' }}
                minW={'50vw'}
            >
                <ModalHeader>{conflictHeading}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>{conflictDescription}</Text>
                    <Flex
                        gap={2}
                        w={'100%'}
                        flexWrap={'wrap'}
                        mt={5}
                    >
                        {conflictEvents.map(((event, i) => (
                            <Box
                                key={i}
                                p={2}
                                flexShrink='0'
                                borderRadius={8}
                                bgColor={`${event.color}cc`}
                                color={'white'}
                            >
                                <Text>{event.title}</Text>
                            </Box>
                        )))}

                    </Flex>

                </ModalBody>

                <ModalFooter>
                    <Button
                        mr={3}
                        colorScheme='blue'
                        as={Link}
                        to={'/my-calendar'}
                        state={
                            { eventStart: conflictEvents[0].start }
                        }
                    >
                        Към календара
                    </Button>
                    <Button variant='ghost' onClick={onClose}>Разбрах</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default ConflictModal
