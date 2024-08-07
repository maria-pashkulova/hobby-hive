import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useToast } from "@chakra-ui/react"
import UserListItem from "./UserListItem";
import { useContext, useState } from "react";

import * as groupService from '../services/groupService';
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/authContext";
import SearchUser from "./SearchUser";

const GroupMembersModal = ({ isOpen, onClose, groupMembers, groupAdmin, isMember, groupId, handleAddMember, handleRemoveMember }) => {


    const navigate = useNavigate();
    const { logoutHandler, userId } = useContext(AuthContext);
    const toast = useToast();

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

            toast({
                title: 'Успешно добавихте член на групата',
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });

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
                <ModalContent
                    maxWidth={{ base: '90vw', md: '80vw', lg: '50vw', xl: '35vw' }}
                >
                    <ModalHeader>Членове на групата</ModalHeader>
                    <ModalCloseButton />


                    <ModalBody pb={'45px'}>

                        {groupMembers.map(member => (
                            <UserListItem
                                key={member._id}
                                user={member}
                                isRemovable={userId === groupAdmin && member._id !== groupAdmin}
                                isAdmin={member._id === groupAdmin}
                                handleRemove={() => handleRemoveUser(member)}
                            />
                        ))}

                        {isMember && (<SearchUser mt='7' handleFunction={handleAddUser} />)}

                    </ModalBody>


                </ModalContent>


            </Modal >

        </>
    )
}

export default GroupMembersModal
