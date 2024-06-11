import { FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from "@chakra-ui/react"
import UserListItem from "./UserListItem";
import Loading from "./Loading";
import { useContext, useState } from "react";

import * as userService from '../services/userService';
import * as groupService from '../services/groupService';
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/authContext";

const GroupMembersModal = ({ isOpen, onClose, groupMembers, groupAdmin, isMember, groupId, handleAddMember, handleRemoveMember }) => {


    const navigate = useNavigate();
    const { logoutHandler, userId } = useContext(AuthContext);
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


    //add another user to the group functionality
    const handleAddUser = async (userToAdd) => {
        const alreadyAdded = groupMembers.find(member => member._id === userToAdd._id);
        if (alreadyAdded) {
            toast({
                title: `${alreadyAdded.fullName} вече е член на тази група`,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            await groupService.addMember(groupId, userToAdd._id);

            //update group state accordingly
            handleAddMember(userToAdd);

        } catch (error) {

            if (error.status === 401) {
                logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                navigate('/login');
            } else {
                toast({
                    title: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
    }

    //remove another user from the group functionality
    //само админа на групата може да премахва потребители
    const handleRemoveUser = async (memberToRemove) => {

        try {
            await groupService.removeMember(groupId, memberToRemove._id);

            //update group state accordingly - function comes from parent component SingleGroupPage
            handleRemoveMember(memberToRemove);

        } catch (error) {

            if (error.status === 401) {
                logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                navigate('/login');
            } else {
                toast({
                    title: error.message,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }
        }
        //handle remove -> toast for permission on status code 403 - имам защита на сървъра - само админа да може да премахва друг освен себе си; 
        //но на клиента може би не трябва да хендълвам по специалиен начин когато статуса е 403 : 
        //1) toast е достатъчен (else); 2) имам клиентска валидация която не позволява да се стигне до заявка ако не си админ

    }


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
                                isRemovable={userId === groupAdmin && member._id !== groupAdmin}
                                isAdmin={member._id === groupAdmin}
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
