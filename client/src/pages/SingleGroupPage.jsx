import { Heading, Button, Container, Flex, useDisclosure, IconButton, Tooltip, AvatarGroup, Avatar, useToast, Spinner } from "@chakra-ui/react"
import { useContext, useEffect, useState } from "react"
import { Link, Outlet, useNavigate, useParams } from "react-router-dom"
import { FiEdit } from "react-icons/fi";

import * as groupService from '../services/groupService';

import AuthContext from '../contexts/authContext';
import UpdateGroupModal from "../components/UpdateGroupModal";
import GroupMembersModal from "../components/GroupMembersModal";


const SingleGroupPage = () => {


    const navigate = useNavigate();
    const { logoutHandler, userId, fullName, email, profilePic } = useContext(AuthContext);


    const { groupId } = useParams();
    const [group, setGroup] = useState({});
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const toast = useToast();

    const editGroupDetailsModal = useDisclosure();
    const groupMembersModal = useDisclosure();


    //change members in the state when user joins or adds other users successfully
    const handleAddMember = (newMember) => {
        setGroup((group) => ({
            ...group,
            members: [...group.members, newMember]
        }));
    }

    //change members in the state when admin removes other users successfully
    const handleRemoveMember = (memberToRemove) => {
        setGroup((group) => ({
            ...group,
            members: group.members.filter(currMember => currMember._id !== memberToRemove._id)
        }))
    }


    //join group functionality
    const handleJoinGroup = async () => {
        try {
            await groupService.addMember(groupId, userId);

            //update group state accordingly
            handleAddMember({
                _id: userId,
                fullName,
                email,
                profilePic
            });

            setIsMember(true);

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

    //leave group functionality
    const handleLeaveGroup = async () => {

        //client-side validation 
        //ако текущо вписания потребител е администратор на групата и иска да напусне
        //да се провери админа единствен член на групата ли е (members.length === 1) - в такъв случай не може да напусне;
        //за да не се стига изобщо до заявка към сървъра

        if (group.groupAdmin === userId && group.members.length === 1) {
            toast({
                title: "Поради липсата на други членове, не може да се назначи нов администратор на групата и не можете да напуснете!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }


        try {
            await groupService.removeMember(groupId, userId);

            navigate('/my-groups');

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


    //TODO: handle group info update


    //TODO: след като групата е успешно намерена - да направя заявка за нейните публикации
    useEffect(() => {
        groupService.getById(groupId)
            .then((currGroup) => {
                setGroup(currGroup);

                const currGroupMemberIds = currGroup.members.map(member => member._id);
                setIsMember(currGroupMemberIds.includes(userId));
            })
            .catch(error => {
                console.log(error.message);

                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                    //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                    navigate('/login');
                } else if (error.status === 404) {
                    navigate('/not-found');
                } else {
                    //handle other errors
                    console.log(error.message);
                }

            })
            .finally(() => {
                setLoading(false);
            })

    }, []);

    return loading ?
        (
            <Flex justifyContent={'center'}>
                <Spinner size='xl' />
            </Flex>

        ) :
        (
            <>

                <Flex justifyContent='space-between'>

                    <Flex flexDirection='column' gap={2} mb={6}>
                        <Flex gap={2}>
                            <Heading mb='6' size='lg'>{group.name}</Heading>

                            {isMember && (<IconButton
                                icon={<FiEdit />}
                                onClick={editGroupDetailsModal.onOpen}
                            />
                            )}

                        </Flex>
                        <p>{group.description}</p>
                    </Flex>
                    <div>
                        <p>Категория хоби : {group.category}</p>
                        <p>Локация: {group.location}</p>
                        <AvatarGroup size='md' max={2} cursor='pointer' onClick={groupMembersModal.onOpen}>
                            {group.members?.map((member) => (
                                <Avatar
                                    key={member._id}
                                    name={member.fullName}
                                    src={member.profilePic}
                                />
                            ))}
                        </AvatarGroup>

                    </div>

                </Flex>

                {/* update group modal */}
                {editGroupDetailsModal.isOpen && <UpdateGroupModal
                    isOpen={editGroupDetailsModal.isOpen}
                    onClose={editGroupDetailsModal.onClose}
                />}

                {/* see current and add members modal */}
                {groupMembersModal.isOpen && <GroupMembersModal
                    isOpen={groupMembersModal.isOpen}
                    onClose={groupMembersModal.onClose}
                    groupMembers={group.members}
                    groupAdmin={group.groupAdmin}
                    isMember={isMember}
                    groupId={groupId}
                    handleAddMember={handleAddMember}
                    handleRemoveMember={handleRemoveMember}
                />}

                <Flex justifyContent='space-between'>
                    <Flex gap={2}>
                        <Button bgColor={"yellow.400"} as={Link} to={`/groups/${groupId}`}>Публикации</Button>

                        {
                            isMember
                                ? (<Button bgColor={"yellow.400"} as={Link} to={`/groups/${groupId}/events`}>Събития</Button>)
                                : (
                                    <Tooltip label='Присъединете се, за да имате достъп до събитията на групата' placement="bottom-end">
                                        <Button bgColor={"yellow.400"} onClick={handleJoinGroup} >Присъединяване</Button>
                                    </Tooltip>
                                )
                        }

                    </Flex>
                    {isMember && (
                        <Button bgColor={"red.400"} onClick={handleLeaveGroup} >Напускане</Button>
                    )}
                </Flex>


                <Container>
                    <Outlet context={[groupId, isMember]} />
                </Container>



            </>

        )
}

export default SingleGroupPage
