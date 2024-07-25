import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Button, Box } from '@chakra-ui/react'
import React from 'react'
import EventDetails from './EventDetails'

const EventDetailsModal = ({ isOpen, onClose, eventDetailsObj }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}

        >
            <ModalOverlay />
            <ModalContent bg="transparent" boxShadow="none"
                maxWidth={{ base: '90vw', md: '80vw', '2xl': '50vw' }}
            >
                <ModalBody>
                    {eventDetailsObj &&
                        <Box width="100%" height="100%">
                            <EventDetails event={eventDetailsObj} />
                        </Box>
                    }
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default EventDetailsModal
