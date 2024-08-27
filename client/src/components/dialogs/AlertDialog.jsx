import { AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button } from "@chakra-ui/react";
import { useRef } from "react";


const AlertDialog = ({ isOpen, onClose, onConfirm, headerText, bodyText, dangerousActionText }) => {
    /*recommended usage in documentation - Based on WAI-ARIA specifications, 
    focus should be placed on the least destructive element when the dialog opens, to prevent users 
    from accidentally confirming the destructive action. 
    */
    const cancelRef = useRef();
    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        {headerText}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {bodyText}
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Отказ
                        </Button>
                        <Button colorScheme='red' onClick={onConfirm} ml={3}>
                            {dangerousActionText}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}

export default AlertDialog
