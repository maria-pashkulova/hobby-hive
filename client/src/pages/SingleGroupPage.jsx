import { TabList, TabPanels, TabPanel, Tabs, Tab, Heading } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import * as groupService from '../services/groupService';


const SingleGroupPage = () => {

    const { groupId } = useParams();
    const [group, setGroup] = useState({});

    useEffect(() => {
        groupService.getById(groupId)
            .then(setGroup);
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
                        FullCalendar
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
