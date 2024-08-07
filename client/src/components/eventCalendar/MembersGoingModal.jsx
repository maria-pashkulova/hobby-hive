import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from "@chakra-ui/react"
import UserListItem from "../UserListItem"

const MembersGoingModal = ({ isOpen, onClose, membersGoing }) => {
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent
                    maxWidth={{ base: '90vw', md: '80vw', lg: '50vw', xl: '35vw' }}
                >
                    <ModalHeader>Членове, които ще присъстват</ModalHeader>
                    <ModalCloseButton />


                    <ModalBody pb={'45px'}>

                        {membersGoing.map(member => (
                            <UserListItem
                                key={member._id}
                                user={member}
                            />
                        ))}

                    </ModalBody>


                </ModalContent>


            </Modal >

        </>
    )
}

export default MembersGoingModal
