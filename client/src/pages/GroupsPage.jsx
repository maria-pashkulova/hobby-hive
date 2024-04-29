import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';

const GroupsPage = () => {

    const [groups, setGroups] = useState([]);

    const fetchGroups = () => {
        fetch('http://localhost:5000')
            .then(res => res.json())
            .then(data => setGroups(data));
    }

    useEffect(() => {
        fetchGroups();
    }, []);


    return (
        <Box mt={10}>
            <ul>
                {groups.map((group, index) => (
                    <li key={index}>{group.name}</li>
                ))}
            </ul>
        </Box>


    )
}

export default GroupsPage
