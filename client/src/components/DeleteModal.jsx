import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react"

const DeleteModal = ({ description, loading, handleDeleteAction, isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent
                maxWidth={{ base: '90vw', md: '80vw', lg: '50vw', xl: '35vw' }}
            >
                <ModalHeader>Внимание!</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {description}
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
