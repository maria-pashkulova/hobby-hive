import { TabList, TabPanels, TabPanel, Tabs, Tab, Heading } from "@chakra-ui/react"
import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import * as groupService from '../services/groupService';

import Calendar from '../components/Calendar';


import AuthContext from '../contexts/authContext';

const SingleGroupPage = () => {


    const navigate = useNavigate();
    const { logoutHandler } = useContext(AuthContext);

    const { groupId } = useParams();
    const [group, setGroup] = useState({});
    //const [groupEvents, setGroupEvents] = useState([]);

    useEffect(() => {
        groupService.getById(groupId)
            .then(setGroup)
            .catch(err => {
                console.log(err.message);
                logoutHandler(); //invalid or missing token - пр логнал си се, седял си опр време, изтича ти токена - сървъра връща unauthorized - изчистваш стейта
                //и localStorage за да станеш неаутентикиран и за клиента и тогава редиректваш
                navigate('/login');
            });
    }, []);

    return (
        <>
            <Heading mb='6'>{group.name}</Heading>
            <Tabs colorScheme='yellow' variant='enclosed'>
                <TabList>
                    <Tab _selected={{ bg: 'yellow.300' }}>Календар за планиране</Tab>
                    <Tab _selected={{ bg: 'yellow.300' }}> Чат</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <Calendar groupEvents={group.events} />
                    </TabPanel>
                    <TabPanel>
                        Group Chat
                    </TabPanel>

                </TabPanels>

            </Tabs >

            <p>Hobby category: {group.category}</p>
            <p>Description: {group.description}</p>
            <p>Location: {group.location}</p>
            <p>members: {group.members}</p>

        </>

    )
}

export default SingleGroupPage
