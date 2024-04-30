import { TabList, TabPanels, TabPanel, Tabs, Tab, Heading } from "@chakra-ui/react"

const SingleGroupPage = () => {
    return (
        <>
            <Heading mb='6'>Група за тенис</Heading>
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
        </>

    )
}

export default SingleGroupPage
