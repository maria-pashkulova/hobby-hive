import { Button, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react"

const DeleteModal = ({ confirmQuestion, additionalDescriptionOne, additionalDescriptionTwo, loading, handleDeleteAction, isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent
                maxWidth={{ base: '90vw', md: '80vw', lg: '50vw', xl: '35vw' }}
                minW={'50vw'}
            >
                <ModalHeader>Внимание!</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Heading as='h3' size={{ base: 'sm', md: 'md' }} mb={5}>{confirmQuestion}</Heading>
                    {additionalDescriptionOne &&
                        <Text
                            mb={2}
                            fontSize={{ base: 'sm', md: 'md' }}
                        >
                            {additionalDescriptionOne}
                        </Text>}
                    {additionalDescriptionTwo &&
                        <Text
                            color='red.400'
                            fontSize={{ base: 'sm', md: 'md' }}
                            fontWeight='bold'>
                            {additionalDescriptionTwo}
                        </Text>}
                </ModalBody>

                <ModalFooter>
                    <Button
                        colorScheme='red'
                        mr={3}
                        isLoading={loading}
                        loadingText='Изтриване...'
                        onClick={handleDeleteAction}
                    >
                        Изтриване
                    </Button>
                    <Button variant='ghost' onClick={onClose}>Отмяна</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default DeleteModal
