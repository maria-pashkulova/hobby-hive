import { FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from "@chakra-ui/react"
import UserListItem from "./UserListItem";
import Loading from "./Loading";
import { useContext, useState } from "react";

import * as userService from '../services/userService';
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/authContext";

const GroupMembersModal = ({ isOpen, onClose, groupMembers, groupAdmin, isMember }) => {


    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();


    const handleSearch = async (query) => {
        setSearch(query);

        //Make request when user has entered at least 3 characters 
        //(whitespace handling included)
        if (query.trim().length >= 3) {

            try {
                setLoading(true);

                //TODO - perform request when minimum 3 symbols are there! -> foodLookup
                const users = await userService.searchUser(query);
                setLoading(false);
                setSearchResult(users);

            } catch (error) {

                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else {
                    toast({
                        title: "Възникна грешка!",
                        description: "Не успяхме да изведем резултата от търсенето",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom-left",
                    });
                }

            }
        } else if (query.trim() === '') {
            setSearchResult([]);
        }

    };

    const handleAddUser = async (user) => {
        console.log('add user');

    }

    const handleRemoveUser = async (member) => {
        console.log('remove user');
    }

    const handleGoToProfile = async () => {
        console.log('go to profile');
    }

    //handle remove -> toast for permission on status code 403
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Членове на групата</ModalHeader>
                    <ModalCloseButton />


                    <ModalBody>

                        {groupMembers.map(member => (
                            <UserListItem
                                key={member._id}
                                user={member}
                                isRemovable={member._id !== groupAdmin}
                                isAdmin={member._id === groupAdmin}
                                handleFunction={() => handleGoToProfile()}
                                handleRemove={() => handleRemoveUser(member)}
                            />
                        ))}

                        {isMember && (
                            <>
                                <FormControl mt={7}>
                                    <FormLabel>Добави други:</FormLabel>
                                    <Input
                                        placeholder='Потърсете потребители...'
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />

                                </FormControl>

                                {loading ? <Loading /> : (
                                    searchResult?.map((user) => (
                                        <UserListItem
                                            key={user._id}
                                            user={user}
                                            handleFunction={() => handleAddUser(user)}
                                        />

                                    ))
                                )}
                            </>

                        )}


                    </ModalBody>

                    <ModalFooter>
                        {/* <Button type='submit' mr={3} colorScheme='blue'>Създай</Button>
                        <Button variant='ghost' onClick={onClose}>
                            Отмяна
                        </Button> */}
                    </ModalFooter>


                </ModalContent>

            </Modal >

        </>
    )
}

export default GroupMembersModal
