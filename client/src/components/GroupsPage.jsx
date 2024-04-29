import React, { useEffect, useState } from 'react'

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
        <ul>
            {groups.map((group, index) => (
                <li key={index}>{group.name}</li>
            ))}
        </ul>

    )
}

export default GroupsPage
