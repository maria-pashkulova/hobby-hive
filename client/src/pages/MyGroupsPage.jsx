import { Button, useDisclosure } from "@chakra-ui/react"
import CreateGroupModal from "../components/CreateGroupModal"
import { FiPlus } from "react-icons/fi";


const MyGroupsPage = () => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <div>
            {/* My Groups + Create Group Button */}

            <Button
                d='flex'
                leftIcon={<FiPlus />}
                onClick={onOpen}
            >
                Създай група
            </Button>

            {isOpen && <CreateGroupModal
                isOpen={isOpen}
                onClose={onClose}
            />}

        </div>
    )
}

export default MyGroupsPage
