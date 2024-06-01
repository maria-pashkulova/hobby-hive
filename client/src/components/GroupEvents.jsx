import { useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import * as eventService from '../services/eventService';
import AuthContext from '../contexts/authContext';

const GroupEvents = () => {

    const navigate = useNavigate();
    const { groupId } = useParams();
    const { logoutHandler } = useContext(AuthContext);
    const [groupEvents, setGroupEvents] = useState([]);

    useEffect(() => {
        eventService.getGroupEvents(groupId)
            .then(setGroupEvents)
            .catch(error => {

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
