import { Heading, Button, Flex, useDisclosure, IconButton, Tooltip, AvatarGroup, Avatar, useToast, Spinner, Menu, MenuButton, MenuList, MenuItem, Text, Tag, VStack, Divider, useBreakpointValue } from "@chakra-ui/react"
import { useContext, useEffect, useState } from "react"
import { Link, Outlet, useNavigate, useParams } from "react-router-dom"
import { FiEdit, FiChevronDown } from "react-icons/fi";

import * as groupService from '../services/groupService';

import AuthContext from '../contexts/authContext';

import UpdateGroupModal from "../components/groups/update-group/UpdateGroupModal";
import GroupMembersModal from "../components/group-members/GroupMembersModal";


const SingleGroupPage = () => {


    const navigate = useNavigate();
    const { logoutHandler, userId, fullName, email, profilePic } = useContext(AuthContext);


    const { groupId } = useParams();
    const [group, setGroup] = useState({});
    const [loading, setLoading] = useState(true); // set loading to true for initial render (otherwise errors occur because group is empty object)
    const [isMember, setIsMember] = useState(false);

    const toast = useToast();

    const editGroupDetailsModal = useDisclosure();
    const groupMembersModal = useDisclosure();

    const showIcon = useBreakpointValue({ base: false, sm: true });



    //change members in the state when user adds other users successfully
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


    //change members in the state when user joins successfully
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

            toast({
                title: `Присъединихте се към група: ${group.name}. Можете да участвате в планирането на събития и в груповия разговор.`,
                status: "success",
                duration: 10000,
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

    //change members in the state when user leaves successfully
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

            toast({
                title: `Напуснахте група: ${group.name}. Вече няма да имате достъп до груповия календар и разговор!`,
                status: "success",
                duration: 10000,
                isClosable: true,
                position: "bottom",
            });

        } catch (error) {

            if (error.status === 401) {
                logoutHandler(); //invalid or missing token
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


    //handle group details update
    const handleUpdateGroupDetails = (updatedGroup) => {
        setGroup({ ...group, ...updatedGroup });
    }

    useEffect(() => {
        groupService.getById(groupId)
            .then((currGroup) => {
                setGroup(currGroup);

                const currGroupMemberIds = currGroup.members.map(member => member._id);
                setIsMember(currGroupMemberIds.includes(userId));
            })
            .catch(error => {

                if (error.status === 401) {
                    logoutHandler(); //invalid or missing token 
                    navigate('/login');
                } else if (error.status === 404) {
                    navigate('/not-found');
                } else {
                    //handle case : error connecting with server or other possible server errors
                    toast({
                        title: 'Нещо се обърка! Опитайте по-късно!',
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });
                }

            })
            .finally(() => {
                if (loading) {
                    setLoading(false); // perform state change only on initial render
                }
            })

    }, [groupId]);

    return loading ?
        (
            <Flex justifyContent={'center'}>
                <Spinner size='xl' />
            </Flex>

        ) :
        (
            <>

                <Flex direction={{ base: 'column', lg: 'row' }} justifyContent='space-between'>

                    <Flex maxWidth={{ base: '100%', lg: '70%' }} flexDirection='column' gap={2} mb={6}>
                        <Flex gap={2}>
                            <Heading mb='6' size='lg'>{group.name}</Heading>

                            {(userId === group.groupAdmin) && (<IconButton
                                icon={<FiEdit />}
                                onClick={editGroupDetailsModal.onOpen}
                            />
                            )}

                        </Flex>
                        <Text>{group.description}</Text>
                    </Flex>
                    <Flex direction='column' gap={2} alignItems={{ base: 'stretch', lg: 'flex-end' }}>
                        <Flex direction='column' gap={2} alignItems={{ base: 'stretch', lg: 'flex-end' }}>
                            <Tag size='lg'
                                variant='outline'
                                colorScheme="blue"
                                padding={2}
                            >
                                Локация: {group.location.name}
                            </Tag>
                            <Tag size='lg'
                                variant='outline'
                                colorScheme="blue"
                                padding={2}
                            >
                                Категория хоби: {group.category.name}
                            </Tag>

                        </Flex>
                        <AvatarGroup mt={2} size='md' max={2} cursor='pointer' onClick={groupMembersModal.onOpen}>
                            {group.members?.map((member) => (
                                <Avatar
                                    key={member._id}
                                    name={member.fullName}
                                    src={member.profilePic}
                                />
                            ))}
                        </AvatarGroup>

                    </Flex>

                </Flex >
                <Divider my={5} />

                {/* update group modal */}
                {
                    editGroupDetailsModal.isOpen && <UpdateGroupModal
                        isOpen={editGroupDetailsModal.isOpen}
                        onClose={editGroupDetailsModal.onClose}
                        groupIdToUpdate={groupId}
                        name={group.name}
                        category={group.category._id}
                        location={group.location._id}
                        description={group.description}
                        groupImg={group.imageUrl}
                        activityTags={group.activityTags}
                        handleUpdateGroupDetails={handleUpdateGroupDetails}
                    />
                }

                {/* see current and add members modal */}
                {
                    groupMembersModal.isOpen && <GroupMembersModal
                        isOpen={groupMembersModal.isOpen}
                        onClose={groupMembersModal.onClose}
                        groupMembers={group.members}
                        groupAdmin={group.groupAdmin}
                        isMember={isMember}
                        groupId={groupId}
                        handleAddMember={handleAddMember}
                        handleRemoveMember={handleRemoveMember}
                    />
                }

                <Flex direction={{ base: 'column', sm: 'row' }} gap={5} justifyContent='space-between'>
                    <Flex
                        gap={2}
                        flexWrap={'wrap'}
                    >
                        {
                            isMember
                                ? (<Menu>
                                    <MenuButton bgColor={"yellow.400"} as={Button} rightIcon={showIcon ? <FiChevronDown /> : null} >
                                        Публикации
                                    </MenuButton>
                                    <MenuList>
                                        <MenuItem as={Link} to={`/groups/${groupId}`}>Всички публикации</MenuItem>
                                        <MenuItem as={Link} to={`/groups/${groupId}/my-posts`}>Моите публикации</MenuItem>
                                    </MenuList>
                                </Menu>)
                                : (<Button bgColor={"yellow.400"} as={Link} to={`/groups/${groupId}`}>Публикации</Button>)

                        }

                        {
                            isMember
                                ? (<Button bgColor={"yellow.400"} as={Link} to={`/groups/${groupId}/events`}>Събития</Button>)
                                : (
                                    <Tooltip label='Присъединете се, за да имате достъп до събитията на групата' placement="bottom-end">
                                        <Button bgColor={"yellow.400"} onClick={handleJoinGroup} >Присъединяване</Button>
                                    </Tooltip>
                                )
                        }

                        {(userId === group.groupAdmin) && (
                            <Tooltip label='Заявки за промяна на събития от членовете на групата' placement="bottom-end">
                                <Button width={{ base: '100%', sm: 'auto' }} bgColor={"yellow.400"} as={Link} to={`/groups/${groupId}/event-change-requests`}>Заявки за събития</Button>
                            </Tooltip>
                        )}


                        {
                            isMember && (<Button width={{ base: '100%', sm: 'auto' }} bgColor={"yellow.400"} as={Link} to={`/groups/${groupId}/chat`}>Групов чат</Button>)
                        }



                    </Flex>
                    {isMember && (
                        <Button bgColor={"red.400"} onClick={handleLeaveGroup} >Напускане</Button>
                    )}
                </Flex>

                <Outlet context={{ isMember, activityTags: group.activityTags, groupRegionCity: group.location.name, groupAdmin: group.groupAdmin }} />

            </>

        )
}

export default SingleGroupPage
