import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as eventService from '../services/eventService';

const GroupEvents = () => {

    const { groupId } = useParams();
    const [groupEvents, setGroupEvents] = useState([]);

    useEffect(() => {
        eventService.getGroupEvents(groupId)
            .then(setGroupEvents)
            .catch(err => {
                console.log(err.message);
                logoutHandler(); //invalid or missing token
                navigate('/login');
            });

    }, []);

    //може би тази заявка трябва да се изпълни чак след като се намери успешно група
    //ако това е възможно изобщо да хвърли грешка, то ще се хване от catch?
    return (
        <div>
            Group Events:
            <div>
                {groupEvents.map(event => <p key={event._id}>{event.title}</p>)}

            </div>
        </div>
    )
}

export default GroupEvents
