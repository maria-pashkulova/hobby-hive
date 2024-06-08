import { Heading, Button, Container, Flex, useDisclosure, IconButton, Tooltip, AvatarGroup, Avatar } from "@chakra-ui/react"
import { useContext, useEffect, useState } from "react"
import { Link, Outlet, useNavigate, useParams } from "react-router-dom"
import { FiEdit } from "react-icons/fi";

import * as groupService from '../services/groupService';

import AuthContext from '../contexts/authContext';
import UpdateGroupModal from "../components/UpdateGroupModal";
import GroupMembersModal from "../components/GroupMembersModal";


const SingleGroupPage = () => {


    const navigate = useNavigate();
    const { logoutHandler, userId } = useContext(AuthContext);


    const { groupId } = useParams();
    const [group, setGroup] = useState({});
    const [isMember, setIsMember] = useState(false);

    const editGroupDetailsModal = useDisclosure();
    const groupMembersModal = useDisclosure();


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

            });

    }, []);


    return (
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
            />}

            <Flex justifyContent='space-between'>
                <Flex gap={2}>
                    <Button bgColor={"yellow.400"} as={Link} to={`/groups/${groupId}`}>Публикации</Button>

                    {
                        isMember
                            ? (<Button bgColor={"yellow.400"} as={Link} to={`/groups/${groupId}/events`}>Събития</Button>)
                            : (
                                <Tooltip label='Присъединете се, за да имате достъп до събитията на групата' placement="bottom-end">
                                    <Button bgColor={"yellow.400"} >Присъединяване</Button>
                                </Tooltip>
                            )
                    }

                </Flex>
                {isMember && (
                    <Button bgColor={"red.400"} >Напускане</Button>
                )}
            </Flex>


            <Container>
                <Outlet />
            </Container>



        </>

    )
}

export default SingleGroupPage
